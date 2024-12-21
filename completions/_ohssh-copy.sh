#compdef ohssh-copy

function _user {
    compadd -x "Имя пользователя"
}

function _address {
    compadd -x "Адрес сервера"
}

_arguments \
    '1:user:_user' \
    '2:address:_address'
