; AutoHotkey скрипт для удобства везде (Edge, VS Code, и т.д.)
; Запускай этот файл двойным кликом (нужен AutoHotkey установлен)

; Переключение языка: Alt + Space -> Win + Space (стандартное переключение)
!Space::Send {LWin down}{Space}{LWin up}

; @ на Alt + 2
!2::Send {@}

; # на Alt + 3
!3::Send {#}

; В Edge: Ctrl + стрелки вверх/вниз -> мгновенно в начало / конец страницы
#IfWinActive ahk_exe msedge.exe
^Up::
{
	Send {Ctrl down}{Home}{Ctrl up}
	return
}

^Down::
{
	Send {Ctrl down}{End}{Ctrl up}
	return
}
#IfWinActive

; Если нужно такое же поведение везде, скопируй блок без #IfWinActive ниже

^Up::Send {Ctrl down}{Home}{Ctrl up}
^Down::Send {Ctrl down}{End}{Ctrl up}