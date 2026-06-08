var white_list = get_characters().map((char) => char.name)


on_party_invite = (name) => {
	if(white_list.includes(name))
	   accept_party_invite(name)
}

on_party_request = (name) => {
	if(white_list.includes(name))
	   accept_party_request(name)
}

var has_full_party = () => {
	let active = Object.keys(parent.get_active_characters()).length
	let party_size = Object.keys(get_party()).length
	
	return party_size >= active
}


var setup_host = () => 
{
	if(Object.keys(parent.get_active_characters()).length > 1 
	&& character.name != get_host())
		localStorage.setItem("host", character.name)
}

var get_host = () => localStorage.getItem("host")
var delete_host = () => localStorage.removeItem("host")

function setup_party()
{
	if(has_full_party()) return;
	
	if(!get_host()) {
		setup_host();
		log("No host")
		return;
	}

	let host_name = get_host()
	if(character.name == host_name)
	{
		move_to_spawn()
		return
	}

	// Check if there are other players near by
	white_list.forEach(p => {
		//Check if these players are in a party
		if(get_player(p) && p.party != null){
			send_party_request(p.id)
		}
	})

	if(character.party) return;

	log("Looking for " + host_name)

	var player = get_player(host_name)
	console.log('Player not found')
	if(player != null)
	{
		console.log(player)
		send_party_request(host_name)
		return;
	}
	
	move_to_spawn()
}


var at_spawn = false;

var move_to_spawn = () => 
{
	if(!at_spawn) {
		at_spawn = true
		goto_spawn()
	}
}