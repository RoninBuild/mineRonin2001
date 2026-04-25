

mapping(address => string) public usernames;
function setUsername(string calldata name) external { usernames[msg.sender] = name; }

