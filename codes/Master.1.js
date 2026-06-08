load_code('Location')
load_code('Inventory')
load_code('Party')
load_code('Attack')

at_spawn = false;
myCharacter = get_character_info()

var is_farming = false

var fight = (farm) => {
	
	goto(farm).then(() => 
	{
		let farm_detail = get_farm_detail(farm)
		do_loner(farm_detail.name)
		update_my_character(myCharacter_properties.last_farm, farm_detail.name)
	})
}

var aid = (char, farm) => {
	goto(farm).then(() => 
	{
		let farm_detail = get_farm_detail(farm)
		do_buddy(char, farm_detail.name)
		update_my_character(myCharacter_properties.last_farm, farm_detail.name)
	})
}

var handle_death = () => {
	log(`${character.name} died`)
	
	attack_mode = false
	is_farming = false;

	setTimeout(respawn, 20000)
}

var start_farming = () =>
{
	if(is_farming) return; 
	
	let is_in_party = character.party != null
	
	if(!is_in_party && !is_farming) return;

	is_farming = true;
	let character_info = JSON.parse(localStorage.getItem(character.id))

	//If we haven't started farming anything, return
	if(character_info.last_farm == null) return;

	fight(character_info.last_farm)
}