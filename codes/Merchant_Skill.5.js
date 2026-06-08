function try_to(skill,location,limit) {
	var skill_name = skill.name.toLowerCase()
	if(!is_in_spot(location, limit)) smart_move(location)
	
	
	var weapon_in_hand = character.slots.mainhand.name
	var required_weapon = skill.wtype[0]
	
	let weapon_slot = locate_item(required_weapon)
	if(weapon_in_hand == null && weapon_slot == -1) return;
	if(weapon_in_hand !== required_weapon)
		equip(weapon_slot)
	
	var is_using_skill = character.c[skill_name]
	if(is_using_skill == null)
		use_skill(skill_name)
}

function is_in_spot(location,limit){
	if(character.map !== location.map) return false;
	
	var x = character.real_x;
	var y = character.real_y;
	
	if(!(x > limit.x.bot && x < limit.x.top)) return false;
	if(!(y > limit.y.bot && y < limit.y.top)) return false;
	
	return true
}

var is_in_mining_spot = () => is_in_spot(mining_spot,mining_limits)
var is_in_fishing_spot = () => is_in_spot(fishing_spot,fishing_limits)

function use_fishing_skill() {
	var required_weapon = fishing_skill.wtype[0]
	if(is_on_cooldown("fishing")) 
	{
		set_message("Skill in CD")
		use_mana_restore()
		return;
	}
	
	if(character.slots.mainhand.name != required_weapon){
		set_message("Equip Rod")
		return;
	}
	if(character.c.fishing == null){
		use_skill("fishing")
	}
}

function use_mining_skill() {
	var required_weapon = mining_skill.wtype[0]
	if(is_on_cooldown("mining")) 
	{
		set_message("Skill in CD")
		use_mana_restore()
		return;
	}
	
	if(character.slots.mainhand.name != required_weapon){
		set_message("Equip Pick")
		return;
	}
	if(character.c.mining == null){
		use_skill("mining")
	}
}

function try_manual_fishing(){
	if(character.map === fishing_spot.map)
	{
		if(!is_in_fishing_spot())
		{
			set_message("Not In Spot")
			return;
		}
		
		use_fishing_skill()
	}
}

function try_manual_mining() {
	if(character.map === mining_spot.map)
	{ 
		if(!is_in_mining_spot())
		{
			set_message("Not In Spot")
			return;
		}
		use_mining_skill()
	}
}
