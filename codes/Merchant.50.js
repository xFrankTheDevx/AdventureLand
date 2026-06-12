load_code("Merchant_Skill")
load_code("Master")

function st() {
	if(top.$('iframe').length == 4) return;
	start_character(p,60)
	start_character(w,40)
	start_character(r,4)
} 

st()

function stp() {
	stop_character(p)
	stop_character(w)
	stop_character(r)
}

function getCharacter(name) {
    for (const iframe of top.$("iframe")) {
        const char = iframe.contentWindow.character
        if (char == null) continue // Character isn't loaded yet
        if (char.name == name) return char
    }
}

function show_char_details() {
    for (const iframe of top.$("iframe")) {
        const char = iframe.contentWindow.character
        if (char == null) continue // Character isn't loaded yet
        
		let gold = (char.gold).toLocaleString('en-US')
		let inv = char.items.filter(i => i != null).length
		
		let output1 = `${char.name}: ${gold}`
		let output2 = `${char.name}: Used ${inv} slots`

		log(output1)
		log(output2)
    }
}

function characters_running() {
	    for (const iframe of top.$("iframe")) {
        const char = iframe.contentWindow.character
        if (char == null) continue  // Character isn't loaded yet
        return true
    }
}

function handle_death() {
	log("Just died")
	set_location()
	setTimeout(respawn, 15000)
}


var show_spot = () => {
	let target_name = get_entity(character.target).mtype
	let x = Math.trunc(character.x)
	let y = Math.trunc(character.y)
	
	console.log(`"${target_name}":{map:"${character.map}",x:${x},y:${y}},`)
}

var save_spot =() => {
	let target_name = get_entity(character.target).mtype
	let x = Math.trunc(character.x)
	let y = Math.trunc(character.y)
	
	log(target_name)
	let farm_spots = null

	let farm_spots_string = localStorage.getItem(farming_spots_key)

	if(farm_spots_string == null) {
		log('Could not find in localStorage')
		log('Getting default values')
		farm_spots = farming_spots
	}
	else
	{
		farm_spots = JSON.parse(farm_spots_string)
	}
	if(farm_spots[target_name])
	{
		target_name = target_name + 1
	}

	farm_spots[target_name] = {map: character.map, x: x, y: y, name:get_entity(character.target).mtype}
	localStorage.setItem("farming_spots", JSON.stringify(farm_spots))
}

//Mining and fishing automation


function use_mana_restore(){
	if(is_on_cooldown("regen_mp")) return;
	if(character.max_mp === character.mp) return;
	use("regen_mp")
}

slot = 3
max_item_lvl = 3
stop_slot = 4;
item_rarity = 1;
finished_upgrading = true
isFishingMiningEnabled = false;
var enableFishingMining = () => { isFishingMiningEnabled = !isFishingMiningEnabled}

var merchant_follow_target = w
var merchant_follow_distance = 150
var merchant_supply_restock_amount = 1000
var merchant_supply_min_count = 100
var merchant_supply_trade_quantity = 500
var merchant_hp_pot_price = 50
var merchant_mp_pot_price = 50
var merchant_supply_slots = {
	"hpot0": "trade1",
	"mpot0": "trade2"
}
var last_merchant_supply_refresh = null
var isMerchantSupportEnabled = false

var set_merchant_follow_target = (name) => { merchant_follow_target = name }
var toggle_merchant_support = () => {
	isMerchantSupportEnabled = !isMerchantSupportEnabled
	set_message(isMerchantSupportEnabled ? "Support On" : "Support Off")

	if(!isMerchantSupportEnabled && character.stand)
		close_stand()
}

var reset_upgrade_loop = (s = 3, ss = 3, mil = 0) =>
{
	slot = s
	max_item_lvl = mil
	stop_slot = ss;
	finished_upgrading = false
}

var loopUpgrade = () => {
	let is_finished = true
	let interval = setInterval(function() 
	{
 		if(slot > stop_slot) 
		{
			log("Reached the end")
			clearInterval(interval);
			return;
		}

		if(!is_finished) return
		
		else is_finished = false

 		do_upgrade(slot, max_item_lvl)
		.then( _ => 
		{
			slot++
			is_finished = true
		})
		.catch(error => 
		{
			console.log(error)
			clearInterval(interval)
		})
	}, 1000)
}

//Fishing
var fishing_spot = {x:-1598,y:471,map:'main'}
var fishing_skill = parent.G.skills.fishing
var fishing_limits = {x:{top:-1590, bot:-1600}, y:{top:590, bot:471}};

//Mining
var mining_spot = {x:-280 ,y:-31 ,map: 'tunnel'}
var mining_skill = parent.G.skills.mining
var mining_limits = {x:{top:-253, bot:-280}, y:{top:-10, bot:-50}};

//Go to Town while Cooldown is up
var go_to_town = true;
var town_spot = {x:-185,y:-85, map:'main'}

var sell_merch = () =>
{
	let item_list = 'coat1;gloves1;shoes1;helmet1;pants1'
	
	for(let i = 3; i < 42; i++)
	{
		let item = character.items[i]
		if(item == null) continue
		if(item_list.includes(item.name) && item.name.includes('1'))
			sell(i,999)
	}
}

function merchant_supply_logic() {
	if(!isMerchantSupportEnabled) return false;

	var target = get_merchant_follow_target()
	if(restock_merchant_potions()) return true;
	if(!target) return false;
	if(follow_merchant_target(target)) return true;

	open_merchant_supply_stand()
	list_merchant_potions()
	return true;
}

function get_merchant_follow_target() {
	var preferred = get_player(merchant_follow_target) || getCharacter(merchant_follow_target)
	if(preferred && !preferred.rip) return preferred;

	var party = get_party()
	for(var name in party)
	{
		if(name == character.name) continue;
		var player = get_player(name) || getCharacter(name)
		if(player && !player.rip) return player;
	}
}

function follow_merchant_target(target) {
	if(!target) return false;
	if(target.map == character.map && distance(character, target) <= merchant_follow_distance) return false;
	if(smart.moving) return true;

	if(character.stand) close_stand()

	smart_move({map: target.map, x: target.real_x || target.x, y: target.real_y || target.y})
	return true;
}

function open_merchant_supply_stand() {
	if(character.stand) return;
	open_stand()
}

function list_merchant_potions() {
	if(!last_use(last_merchant_supply_refresh, 5000)) return;

	if(character.slots['trade1'] || character.slots['trade1'].name !== "hpot0" || character.slots['trade1'].q < 100){
		unequip('trade1');
		list_merchant_potion("hpot0", merchant_supply_slots["hpot0"], merchant_hp_pot_price)
	}

	if(character.slots['trade2'] || character.slots['trade2'].name !== "mpot0" || character.slots['trade2'].q < 100){
		unequip('trade2');
		list_merchant_potion("mpot0", merchant_supply_slots["mpot0"], merchant_hp_pot_price)
	}

	last_merchant_supply_refresh = new Date();
}

function list_merchant_potion(name, trade_slot, price) {
	var slot = locate_item(name)
	if(slot == -1) return;

	trade(
		slot,
		trade_slot,
		price,
		Math.min(quantity(name), merchant_supply_trade_quantity)
	)
}

function restock_merchant_potions() {
	var needs_hp = quantity("hpot0") < merchant_supply_min_count
	var needs_mp = quantity("mpot0") < merchant_supply_min_count
	if(!needs_hp && !needs_mp) return false;

	if(smart.moving) return true;
	if(character.stand) close_stand()

	smart_move({to:"potions",return:true}, function() {
		if(needs_hp) buy_with_gold("hpot0", merchant_supply_restock_amount)
		if(needs_mp) buy_with_gold("mpot0", merchant_supply_restock_amount)
		sell_inventory()
	})

	return true;
}

setInterval(function() {
	add_top_button("Support", "Support", toggle_merchant_support)
	add_bottom_button("Upgrade", "Upgrade", loopUpgrade)
	add_bottom_button("Display", "Display", show_spot)
	add_bottom_button("Save", "Save", save_spot)
	add_bottom_button("Enable", "Enable", enableFishingMining)
	
	setup_party()
	
	if(character.party == null) return;
	
	use_mana_restore()
	
	if(is_moving(character)) return

	if(merchant_supply_logic()) return;

	if(!is_on_cooldown("fishing") && isFishingMiningEnabled)
	{
		try_to(fishing_skill,fishing_spot, fishing_limits)
		return
	}
	
	if(!is_on_cooldown("mining") && isFishingMiningEnabled) 
	{	
		try_to(mining_skill, mining_spot, mining_limits)
		return
	}
	
	if(is_on_cooldown("fishing") && is_on_cooldown("mining") && go_to_town)
	{
		if(character.real_x === town_spot.x && 
		   character.real_y === town_spot.y) return;
	
		smart_move(town_spot).then( () => sell_merch())
	}

		
}, 500);
