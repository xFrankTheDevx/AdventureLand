var myCharacter_properties =
{
    location: "location",
    last_farm: "last_farm"

}

var myCharacter = null

var set_location = () => {
    let x = Math.trunc(character.real_x)
    let y = Math.trunc(character.real_y)
    let map = character.map 
    let loc = {x:x, y:y , map: map}
    update_my_character(myCharacter_properties.location, loc)
}

var get_character_info = () => JSON.parse(localStorage.getItem(character.id))

var update_my_character = (property_name, value) => {
    if(myCharacter == null) 
        myCharacter = get_character_info()
    if(myCharacter == null)
        myCharacter = {}

    myCharacter[property_name] = value

    localStorage.setItem(character.id, JSON.stringify(myCharacter))
}

var locate = (name) => get(name)

var tp = (name) => {
	attack_mode = false
	change_target(null)
	smart_move(locate(name == null ? "BotMerchant" : name))
}

set_location()

var farming_spots_key = 'farming_spots'

var farming_spots = {
'spawn': {name: null,x: -185, y: -85, map: "main"},
'snake': {name: 'snake', map: "halloween", x: 238, y: -733},
'snake1': {name: 'snake', map: "halloween", x: -603, y: -522},
'spider': {name: 'spider',map: "main", x: 870, y: -249},
'croc': {name: 'croc', map: "main", x: 916, y: 1570},
'poisio': {name:'poisio', map: "main", x: -229, y: 1351},
'crabx': {name:'crabx', map: "main", x: -677, y: 1585},
'arcticbee': {name: 'arcticbee', map: "winterland", x: 966, y: -959},
'goo': {name: 'goo', map: "main", x: -87, y: 673},
'bat': {name: 'bat', map: "cave", x: -164, y: -378},
'bat1': {name: 'bat', map: "cave", x: 453, y: -1038},
'bat2': {name: 'bat', map: "cave", x: 1108, y: -826},
'squig': {name: 'squig', map: "main", x: -1234, y: 454},
'bee': {name: 'bee', map: "main", x: 341, y: 1029},
'scorpion': {name: 'scorpion',map: "main", x: 1698, y: -393},
'armadillo': {name: 'armadillo',map: "main", x: 474, y: 1726},
'crab': {name: 'crab',map: "main", x: -1190, y: -97},
'squigtoad': {name: 'squigtoad',map: "main", x: -1134, y: 455},
'porcupine': {name: 'porcupine', map: "desertland", x: -622, y: 194},
'rat': {name: 'rat', map: "mansion", x: 174, y: -15}
}

var get_farm_detail = (farm) => {
    var info = JSON.parse(localStorage.getItem(farming_spots_key))
    return info[farm]
}

var goto_spawn = () => smart_move(farming_spots.spawn)

var goto = (farm) => new Promise( (res, rej) => {
    attack_mode = false
    change_target(null)

    let farm_spots = get_farming_spots()

    let x = farm_spots[farm].x + Math.random()*50
    let y = farm_spots[farm].y + Math.random()*50
    let map = farm_spots[farm].map
    
    smart_move({x:x, y:y, map:map})
    .then(() => res("Success"))
    .catch(e => rej(e))
})

get_farming_spot_entries = () => Object.keys(JSON.parse(localStorage.getItem(farming_spots_key)))

get_farming_spots = () => {
    let farm_spots = JSON.parse(localStorage.getItem(farming_spots_key))
    
    if(farm_spots != null) return farm_spots;
    
    update_farming_spots()
    return farming_spots;
}

update_farming_spots = (spots) => 
{
    if(spots == null)
    {
        localStorage.setItem(farming_spots_key, JSON.stringify(farming_spots))
        return
    }

    let farm_spots = get_farming_spots()
    farm_spots[spots] = value
    localStorage.setItem(farming_spots_key, JSON.stringify(farming_spots));
}
