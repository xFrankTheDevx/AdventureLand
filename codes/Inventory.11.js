var sell_list = 'hpbelt;hpamulet;bwing;poison;stramulet;intamulet;ringsj;hhelmet;harmor;hgloves;hpants;hboots;strring;intring;strring;vitring;dexring;rattail;crabclaw;cclaw;frogt;gslime;sstinger'

var w = "FTDWarrior"
var p = "BotPriest"
var r = "BotRanger"
var m = "BotMerchant"

function send_to_merch() {
	give_gold()
	for(var i =3; i<42; i++){
		var item = character.items[i]
		if(item == null) continue
		if(sell_list.includes(item.name)) continue
		send_item("BotMerchant",i,9999)
	}
}

function sell_inventory() {
	for (var i = 3; i < 42; i++)
	{
		var item = character.items[i];
		if(item == null) continue;
		if(!sell_list.includes(item.name)) continue;
		log(`selling ${item.name}`)
		sell(i,9999)
	}
}

var get_used_inventory = () => character.items.filter(i => i != null).length

var find_items = (name, level) => character.items.filter((item, index) => 
{
	if(item != null && item.name == name && (level == null || level == item.level))
	{
		item["slot"] = index
		return item
	}
})

var last_use_mp = null;
var last_use_hp = null;
var pot_amt = 500
var merchant_potion_buy_range = 400
var merchant_potion_buy_amount = 500
var merchant_potion_min_count = 5
var merchant_potion_slots = {
	"hpot0": "trade1",
	"mpot0": "trade2"
}
var last_merchant_potion_buy = null

function handle_potions(hp_amt, mp_amt) {	
	if(character.mp < character.mp_cost * 5){
        run_for_pots("mpot0", pot_amt);
		if(last_use(last_use_mp, parent.G.skills.use_mp.cooldown)){
            use("mp");
            last_use_mp = new Date();
        }
	}
	else if ((character.max_hp - character.hp) > hp_amt){
        run_for_pots("hpot0", pot_amt);
        if(!is_on_cooldown("use_hp")){
            use("hp");
            last_use_hp = new Date();
        }
	}
	else if (character.max_mp - character.mp > mp_amt){
        run_for_pots("mpot0", pot_amt);
		if(!is_on_cooldown("use_mp")){
            use("mp");
            last_use_mp = new Date();
        }
	}
}

function run_for_pots(pot_type, pot_amt) {
    if(item_quantity(pot_type)<merchant_potion_min_count) // item_quantity is defined below
    {
		if(buy_pots_from_merchant(pot_type, pot_amt)) return;
		if(smart.moving) return;
		
        smart_move({to:"potions",return:true},function(){ 
			buy_with_gold(pot_type,pot_amt); 
			sell_inventory()
		});
        // {to:"potions"} is ~equal to {"map":"main","x":56,"y":-122}
        // {return:true} brings you back to your original position
        // while the smart_move is happening, is_moving is false
        // therefore the attack routine doesn't execute
        // when the smart_move destination is reached
        // buy("mpot0",10); executes and buys 10 potions
        return;
    }
}

function buy_pots_from_merchant(pot_type, pot_amt) {
	var merchant = get_player(m)
	if(!merchant || !merchant.stand) return false;
	if(distance(character, merchant) > merchant_potion_buy_range) return false;
	if(!last_use(last_merchant_potion_buy, 3000)) return true;

	var trade_slot = merchant_potion_slots[pot_type]
	if(!trade_slot || !merchant.slots || !merchant.slots[trade_slot]) return false;

	var listing = merchant.slots[trade_slot]
	if(listing.name != pot_type) return false;

	var quantity_needed = pot_amt - item_quantity(pot_type)
	if(quantity_needed <= 0) return true;

	trade_buy(merchant, trade_slot, Math.min(quantity_needed, merchant_potion_buy_amount, listing.q || 1))
	last_merchant_potion_buy = new Date();
	return true;
}

function item_quantity(name)
{
	for(var i=0;i<42;i++)
	{
		if(character.items[i] && character.items[i].name==name) return character.items[i].q||0;
	}
	return 0;
}

var last_use = (time, cooldown) =>time == null || (new Date() - time) > cooldown;

var give_gold = () => send_gold("BotMerchant", character.gold > 100000 ? character.gold - 100000 : 0)

var has_full_inventory = () => { 
	for(let i = 3; i < 42; i++) 
	{
		if(character.items[i] == null) return false
	}

	return true
}

var slot = 3
var max_item_lvl = 3
var stop_slot = 4;
var finished_upgrading = false

// Scroll logic
var buy_compound_scroll = (i = 0, amt = 10) => new Promise((resolve, reject) => {
	buy_scroll(`cscroll${i}`, amt)
	.catch((error) => reject(error))
	
	resolve('Success')
})

var buy_upgrade_scroll = (i = 0, amt = 10) => new Promise((resolve, reject) =>
{
	buy_scroll(`scroll${i}`, amt)
	.catch( (error) => reject(error))
	
	resolve('Success')
})

var buy_stat_scroll =(name, amt = 10) => new Promise((_, reject) => {
	buy_scroll(`${name}scroll`, amt)
	.catch((error) => reject(error))
})

var buy_scroll = (name, amt) => new Promise((resolve, reject) =>
{
	buy_with_gold(name, amt).then(
		success=> resolve("Success"),
		error => reject({msg: `No money to buy ${name}`, tag: 'money'})
	)
})

var compound_item = (item_slot) => new Promise((_, reject) => {
	let item = character.items[item_slot]
	
	if(item == null) {
		reject({msg: "Item is null", tag: "Error"})
		return;
	}	
	
	if(character.q.compound != null) {
		reject({msg:"Already in progress", tag: "NotFinished"})
		return;
	}

	if(has_full_inventory()) 
	{
		reject("Full Inventory")
		return;
	}

	let rarity = item_grade(item)
	let scroll = `cscroll${rarity}`
	
	// Find similar items
	var item_list = find_items(item.name, item.level).map((x) => x.slot)

	if(item_list.length < 3)
	{
		reject("Not enough items")
	}
	
	// Find scroll
	let j = get_scroll_slot(scroll)
	
	if(j == -1) 
	{
		buy_compound_scroll(rarity,1).catch(e => reject(e))
		return;
	}
	
	use("massproduction")
	compound(item_list[0],item_list[1],item_list[2],j)
})

var get_scroll_slot = (scroll) => locate_item(scroll)

var upgrade_item = (item_slot, max_upgrade) => new Promise(async (_, reject) =>
{
	let item = character.items[item_slot]

	if(item == null) {
		reject({msg: "Item is null", tag: "Error"})
		return;
	}

	if(max_upgrade != null && max_upgrade == item.level)
	{
		resolve('Finished')
		return
	}
	
	if(character.q.upgrade) {
		reject({msg:"Already in progress", tag: "NotFinished"})
		return
	}

	if(has_full_inventory()) 
	{
		reject("Full Inventory")
		return
	}

	let rarity = item_grade(item)
	let scroll = `scroll${rarity}`
	
	// Find scroll
	let scroll_slot = get_scroll_slot(scroll)
	
	if(scroll_slot == -1) 
	{
		buy_upgrade_scroll(rarity,1).catch(e => reject(e))
		return;
	}
	
	scroll_slot = get_scroll_slot(scroll);

	use("massproduction")
	upgrade(item_slot , scroll_slot)
})

function do_upgrade(item_slot, max_upgrade) {
	return new Promise((resolve, reject) => {
		
		let item = character.items[item_slot]
		if(item == null) 
		{
			reject('Item null')
			return;
		}

		let int = setInterval(_ => {
			item = character.items[item_slot]
			if(item == null || item.level >= max_upgrade)
			{
				clearInterval(int);
				resolve('success')
				return;
			}
			
			upgrade_item(item_slot, max_upgrade)
			.catch(e => 
			{
				console.log(e)
			})
		}, 500)
	})
}

function do_compound(item_slot) {
	let item = character.items[item_slot]
	if(item == null) return;

	let item_start_level = item.level + 1;

	let int = setInterval(_ => {
		let item = character.items[item_slot]
		if(item == null || item.level >= item_start_level)
		{
			clearInterval(int)
			return;
		}

		compound_item(item_slot);
	}, 500)
}
