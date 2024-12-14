local display = false

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- Press F1 to toggle
        if IsControlJustPressed(1, 288) then
            display = not display
            SetNuiFocus(display, display)
            SendNUIMessage({
                type = "ui",
                status = display
            })
            if display then
                -- Request player list and server info
                TriggerServerEvent('keybinds_panel:requestPlayers')
                TriggerServerEvent('keybinds_panel:requestServerInfo')
            end
        end
    end
end)

-- Receive updated player list from server
RegisterNetEvent('keybinds_panel:updatePlayers')
AddEventHandler('keybinds_panel:updatePlayers', function(playerData, onlineCount, maxPlayers)
    SendNUIMessage({
        type = "updateLeaderboard",
        players = playerData,
        onlineCount = onlineCount,
        maxPlayers = maxPlayers
    })
end)

-- Receive server info from server
RegisterNetEvent('keybinds_panel:updateServerInfo')
AddEventHandler('keybinds_panel:updateServerInfo', function(info)
    SendNUIMessage({
        type = "updateServerInfo",
        serverInfo = info
    })
end)

RegisterNUICallback('close', function(data, cb)
    display = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = "ui",
        status = false
    })
    cb('ok')
end)

RegisterNUICallback('refreshLeaderboard', function(data, cb)
    TriggerServerEvent('keybinds_panel:requestPlayers')
    cb('ok')
end)

RegisterNUICallback('refreshServerInfo', function(data, cb)
    TriggerServerEvent('keybinds_panel:requestServerInfo')
    cb('ok')
end)
