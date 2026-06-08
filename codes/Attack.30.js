var attack_mode=false
var challenge_mode=false
var full_health_challenge=false
var challenge_type = null

var do_loner = () => {
	battle_mode = loner
	attack_mode = true
}

var do_buddy = (char) => {
	battle_mode = buddy
	attack_mode = true
	warrior = char
}

var do_passive = () => {
	battle_mode = loner
	attack_mode = false
}

var battle_mode

var loner = "loner"
var buddy = "buddy"

var warrior = w

var location_counter = 0

var max_attack_limit = 700

function attack_logic(skill_logic){
	
	if(character.rip) return;

	handle_potions(200, 300);

    if(is_moving(character)) return;

	if(attack_mode){
		let target=get_targeted_monster();

		if(battle_mode == loner)
		{
			// Do Loner logic
			loner_logic(target)
		}

		if(battle_mode == buddy)
		{
			// Do buddy logic
			buddy_logic(target,skill_logic)
		}

		if(battle_mode == buddy && character.ctype === "priest") {
			priest_logic();
		}

	}
	
	loot();

}

var loner_logic = (target) => 
{
	if(target == null)
	{
		target =  get_new_target()
	}

	if(target == null) return;

	attack_target(target)
}

var buddy_logic = (target,skill_logic) => {
	let p = get_player(warrior)
	if(p == null || p.rip) return;

	target=get_targeted_monster();
	if(target == null)
	{
		target=get_nearest_monster({target:warrior});
		if(target != null) change_target(target);
		else
		{
			set_message("No Monsters");
			loot()
			return;
			}
		}

	attack_target(target);
}

var priest_logic = () => {
	if(character.ctype=='priest' && !is_on_cooldown("heal"))
	{
		var player = get_player(warrior);
		// Do heal logic
		if(player != null && need_healing(player))
		{
			if(!is_in_range(player))
			{
				if(!is_moving(character))
				{
					move(
						character.x+(player.x-character.x)/2,
						character.y+(player.y-character.y)/2
					);
				}
			}
			
			heal(player)
			return;
		}

		if(need_healing(character))
		{
			heal(character)
			return
		}
	}
}

var attack_target = (target) =>
{
	if(!can_move_to(target.x,target.y)) {
		change_target(null)
		return;
	}

	if(!is_in_range(target))
			{
				if(!is_moving(character)){
					move(
						character.x+(target.x-character.x)/2,
						character.y+(target.y-character.y)/2
					);
				}
				// Walk half the distance
			}
			else if(can_attack(target))
			{
				location_counter++
				set_message("Attacking");
				if(location_counter == 5) {
					set_location()
					location_counter = 0
				}
				attack(target);
			}
}

function get_new_target()
{
	let target = null; 
	if(challenge_mode)
	{
		if(full_health_challenge && (character.max_hp - character.hp < 200))
		{
			target=get_nearest_monster(
				{
					min_xp:100,
					max_att:max_attack_limit,
					type:challenge_type
				});
		}
		else
		{
			target=get_nearest_monster(
				{
					min_xp:100,
					max_att:500,
					type:challenge_type
				});
		}
	}
	else
		target=get_nearest_monster({no_target:true,min_xp:100,max_att:125});

	if(target != null) change_target(target);
	else
	{
		set_message("No Monsters");
		loot();
		return;
	}
	return target;
}

var need_healing =(player) => player.max_hp - player.hp > character.attack

at_spawn = false;

var handle_death = () => {
	log(`${character.name} died`)
	
	attack_mode = false
	set_location()

	setTimeout(respawn, 15000)
}
