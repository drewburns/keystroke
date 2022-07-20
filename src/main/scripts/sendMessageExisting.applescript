
	if isFile then
		set message to POSIX file filePath
	end if

	tell application "Messages"
		send message to chat id chatID
	end tell
