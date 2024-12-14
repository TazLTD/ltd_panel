RegisterNetEvent('keybinds_panel:requestPlayers', function()
    local src = source
    local players = GetPlayers()
    local playerData = {}

    local maxPlayers = GetConvarInt('sv_maxclients', 32)

    for i, playerId in ipairs(players) do
        local playerName = GetPlayerName(playerId) or "Unknown"
        table.insert(playerData, {
            rank = i,
            name = playerName
        })
    end

    TriggerClientEvent('keybinds_panel:updatePlayers', src, playerData, #players, maxPlayers)
end)

RegisterNetEvent('keybinds_panel:requestServerInfo', function()
    local src = source
    local serverInfo = {
        name = GetConvar("sv_hostname", "My Server"),
        uptime = "2h 35m",
        events = {
            { title = "Double XP Weekend", description = "Earn double XP until Sunday evening!" },
            { title = "Car Meet", description = "Car show at Legion Square, Sat 7pm" }
        }
    }
    TriggerClientEvent('keybinds_panel:updateServerInfo', src, serverInfo)
end)
