/* eslint-disable guard-for-in */
import { Grid, Modal } from '@mui/material';
import mixpanel from 'mixpanel-browser';
import { ipcMain, ipcRenderer } from 'electron';
import axios from 'axios';
import React from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { useGlobalState, GlobalStateProvider } from './util/GlobalContext';
import icon from '../../assets/icon.svg';
import './App.css';
import ChatPage from './components/ChatPage';
import Sidebar from './components/Sidebar';
import Reminders from './pages/Reminders';
import { formatPhoneNumber } from './util';
import NewChat from './components/NewChat';
import CreateReminderModal from './components/CreateReminderModal';
import TimedMessageFeed from './pages/TimedMessageFeed';
import Settings from './pages/Settings';
import PayMe from './pages/PayMe';
import { myID } from './myid';
import Broadcast from './pages/Broadcast';
import TopSideBar from './components/TopSideBar';

type SelectedChatType = {
  chatGuid: string;
  chatName: string;
};

const Hello = () => {
  mixpanel.init('f5cd229535c67bec6dccbd57ac7ede27');

  const { setState } = useGlobalState();
  const [chatThreads, setChatThreads] = React.useState([]);
  const [isPaid, setIsPaid] = React.useState(false);
  const [page, setPage] = React.useState('reminders');
  const [nameNumbers, setNameNumbers] = React.useState({});
  const [selectedChat, setSelectedChat] = React.useState<SelectedChatType>({
    chatGuid: '',
    chatName: '',
  });

  const [messageForRemindCreate, setMessageForRemindCreate] = React.useState(
    {}
  );

  // TODO: abstract this out!!
  const getChatUserHandle = (numberList: string[], displayName = null) => {
    if (displayName) {
      return displayName;
    }
    const list: string[] = [];
    if (numberList.length === 1) {
      if (numberList[0].includes('@')) return numberList[0];
      return nameNumbers[formatPhoneNumber(numberList[0])] || numberList[0];
    }
    // TODO: add marker for SMS
    numberList.forEach((n) => {
      // console.log('getting handle here', nameNumbers[formatPhoneNumber(n)]);
      // console.log('their number', n, formatPhoneNumber(n));
      if (!formatPhoneNumber(n)) {
        list.push(n);
      } else {
        list.push(
          nameNumbers[formatPhoneNumber(n)]
            ? nameNumbers[formatPhoneNumber(n)].split(' ')[0]
            : n
        );
      }
    });
    return list.sort().reverse().join(', ');
  };
  React.useEffect(() => {
    if (page !== 'chat') {
      setSelectedChat({
        chatGuid: '',
        chatName: '',
      });
    }
  }, [page]);

  const checkIfPaid = async (code: string) => {
    const res = await axios.get(
      'https://gist.github.com/drewburns/e4e17713c7e8a936dea1803167559703'
    );
    const paidUsers = res.data;
    if (paidUsers.includes(code)) {
      setIsPaid(true);
      window.electron.ipcRenderer.sendMessage('set-access-code', code);
    }
    // setIsPaid(false);
  };

  React.useEffect(() => {
    mixpanel.track('App load');
    window.electron.ipcRenderer.on('asynchronous-message', (res: any) => {
      setChatThreads(res.data);
    });
    window.electron.ipcRenderer.once('get-access-code', (res: any) => {
      console.log('accesscode', res);
      checkIfPaid(res);
    });
    window.electron.ipcRenderer.sendMessage('get-access-code');
    window.electron.ipcRenderer.once('name-numbers', (res: any) => {
      console.log('namenums', nameNumbers);
      // eslint-disable-next-line no-console
      // setChatThreads(res.data);
      const { data } = res;
      const tempData = {};
      data.forEach((row: any) => {
        const number = formatPhoneNumber(row.ZFULLNUMBER);
        const name = `${row.ZFIRSTNAME} ${row.ZLASTNAME || ''}`;
        tempData[number] = name;
      });
      setState({ nameNumbers: tempData });
      setNameNumbers(tempData);
      // const name = `${res.data.ZFIRSTNAME} ${res.data.ZLASTNAME}`;
      // // const phoneNumber =
      // console.log(res.data['ZABCDPHONENUMBER.ZFULLNUMBER']);
      // const;
    });
  }, []);

  React.useEffect(() => {
    window.electron.ipcRenderer.on('go-to-page-keypress', (newPage: any) => {
      const curIndex = chatThreads.findIndex(
        (thread) => thread['chat.guid'] === selectedChat.chatGuid
      );
      if (newPage === 'upChat') {
        mixpanel.track('up chat arrow used');
        if (curIndex !== 0) {
          const row = chatThreads[curIndex - 1];
          setSelectedChat({
            chatGuid: row['chat.guid'],
            chatName: getChatUserHandle(
              row.member_list.split(','),
              row['chat.display_name']
            ),
          });
        }
        return;
      }
      if (newPage === 'downChat') {
        mixpanel.track('Down chat arrow used');
        const row = chatThreads[curIndex + 1];
        setSelectedChat({
          chatGuid: row['chat.guid'],
          chatName: getChatUserHandle(
            row.member_list.split(','),
            row['chat.display_name']
          ),
        });
        return;
      }
      setPage(newPage);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('go-to-page-keypress');
    };
  }, [selectedChat]);

  const updateSelectedChat = (data: any) => {
    setSelectedChat(data);
    setPage('chat');
  };

  const goToChat = (chatGuid: string) => {
    mixpanel.track('Chat selected');
    const row = chatThreads.find((r) => r['chat.guid'] === chatGuid);
    setSelectedChat({
      chatGuid: row['chat.guid'],
      chatName: getChatUserHandle(
        row.member_list.split(','),
        row['chat.display_name']
      ),
    });
    setPage('chat');
  };

  // if (!isPaid) {
  //   return <PayMe tryCode={checkIfPaid} />;
  // }

  return (
    <div>
      <Modal
        open={messageForRemindCreate['message.ROWID']}
        onClose={() => setMessageForRemindCreate({})}
      >
        <CreateReminderModal
          message={messageForRemindCreate}
          setMessageForRemindCreate={setMessageForRemindCreate}
        />
      </Modal>
      <Grid container>
        <Grid item xs={3}>
          <Sidebar
            selectedChat={selectedChat}
            setPage={setPage}
            chatThreads={chatThreads}
            nameNumbers={nameNumbers}
            setSelectedChat={updateSelectedChat}
            getChatUserHandle={getChatUserHandle}
          />
        </Grid>
        {/* <TopSideBar setPage={setPage} /> */}
        <Grid item xs={9}>
          {page === 'reminders' && (
            <Reminders
              isPaid={isPaid}
              getChatUserHandle={getChatUserHandle}
              goToChat={goToChat}
              nameNumbersLoaded={Object.keys(nameNumbers).length !== 0}
            />
          )}
          {page === 'chat' && (
            <ChatPage
              messageForRemindCreate={messageForRemindCreate}
              setMessageForRemindCreate={setMessageForRemindCreate}
              chatGuid={selectedChat.chatGuid}
              chatName={selectedChat.chatName}
            />
          )}
          {page === 'newChat' && (
            <NewChat
              setSelectedChat={setSelectedChat}
              nameNumbers={nameNumbers}
              setPage={setPage}
            />
          )}
          {page === 'timedMessages' && (
            <TimedMessageFeed getChatUserHandle={getChatUserHandle} />
          )}
          {page === 'settings' && (
            <Settings tryCode={checkIfPaid} isPaid={isPaid} />
          )}
          {page === 'broadcast' && (
            <Broadcast isPaid={isPaid} nameNumbers={nameNumbers} />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

// TODO: use the routes
export default function App() {
  return (
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/new" element={<p>hello</p>} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}
