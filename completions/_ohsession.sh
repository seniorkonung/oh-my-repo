#compdef ohsession

function _sessions {
    compadd $(ls $OH_MY_REPO/kitty/sessions)
}

_arguments '1:session:_sessions'
