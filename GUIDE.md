# Adventure Land Code Guide

This is a living navigation guide for the Adventure Land JavaScript files in `codes/`. Keep this file outside `codes/` because Adventure Land expects code files there to be JavaScript.

## Hard Rule

`base/runner_functions.js` is reference-only. Do not edit, reformat, move, rename, overwrite, or delete it.

## How The Files Fit Together

The numbered suffixes match Adventure Land code slots. For example, `Master.1.js` is loaded as code slot `1`, while `Priest.60.js` is loaded as code slot `60`.

Most active character files are thin wrappers that load `Master`, then let shared logic decide what to do.

## Startup Files

| File | Purpose |
| --- | --- |
| `Master.1.js` | Main farming controller. Loads `Location`, `Inventory`, `Party`, and `Attack`. |
| `Warrior.40.js` | Warrior entrypoint. Loads `Master`. |
| `Ranger.4.js` | Ranger entrypoint. Loads `Master`. |
| `Priest.60.js` | Priest entrypoint. Loads `Master`. |
| `Merchant.50.js` | Merchant entrypoint, merchant-specific automation, and party potion supply. Loads `Merchant_Skill`, `Location`, `Inventory`, and `Party`. |

## Shared Utility Files

| File | Purpose |
| --- | --- |
| `Inventory.11.js` | Potions, merchant-first potion purchasing, selling, item lookup, gold transfer, upgrading, and compounding. |
| `Location.12.js` | Character location tracking, farm spots, movement helpers, and teleport helpers. |
| `Party.10.js` | Party host setup, invites, whitelist, and spawn movement. |
| `Layout.21.js` | Small UI/layout toggles. Currently includes follow toggle support. |

## Combat And Class Logic

| File | Purpose |
| --- | --- |
| `Attack.30.js` | Main targeting and attack behavior. Depends on `Location`, `Inventory`, and `Party` being loaded by `Master`. |
| `Priest.60.js` | Priest runtime entrypoint. Current priest healing is handled by `Attack.30.js` while in buddy mode. |
| `Mage_Skills.3.js` | Mage-specific skill logic. |
| `Merchant_Skill.5.js` | Fishing, mining, and merchant skill helpers. |

## Common Commands And Functions

Use these from the Adventure Land console or from other scripts when the corresponding file is loaded.

| Command / Function | Defined In | What It Does |
| --- | --- | --- |
| `start_farming()` | `Master.1.js` | Starts the main farming loop. |
| `fight(farm)` | `Master.1.js` | Starts fighting at a named farm spot. |
| `aid(char, farm)` | `Master.1.js` | Assists another character at a farm spot. |
| `attack_logic(skill_logic)` | `Attack.30.js` | Main attack loop, optionally using class skill logic. |
| `get_new_target()` | `Attack.30.js` | Finds the next target. |
| `handle_potions(hp_amt, mp_amt)` | `Inventory.11.js` | Uses HP/MP potions based on thresholds. |
| `buy_pots_from_merchant(pot_type, pot_amt)` | `Inventory.11.js` | Buys potions from `BotMerchant` when the merchant is nearby with an open stand. |
| `send_to_merch()` | `Inventory.11.js` | Sends configured items to the merchant. |
| `sell_inventory()` | `Inventory.11.js` | Sells items from the configured sell list. |
| `give_gold()` | `Inventory.11.js` | Sends excess gold to `BotMerchant`. |
| `do_upgrade(item_slot, max_upgrade)` | `Inventory.11.js` | Runs upgrade logic for an inventory slot. |
| `do_compound(item_slot)` | `Inventory.11.js` | Runs compound logic for an inventory slot. |
| `goto(farm)` | `Location.12.js` | Smart moves to a named farm spot. |
| `goto_spawn()` | `Location.12.js` | Moves to the configured spawn location. |
| `tp(name)` | `Location.12.js` | Teleports to a named character if available. |
| `setup_party()` | `Party.10.js` | Sets up party behavior. |
| `setup_host()` | `Party.10.js` | Sets the current character as party host. |
| `delete_host()` | `Party.10.js` | Clears the saved party host. |
| `st()` | `Merchant.50.js` | Starts configured party characters. |
| `stp()` | `Merchant.50.js` | Starts priest/warrior/ranger using their configured slots. |
| `show_char_details()` | `Merchant.50.js` | Logs visible character details. |
| `characters_running()` | `Merchant.50.js` | Checks which configured characters are running. |
| `save_spot()` | `Merchant.50.js` | Saves the current merchant spot. |
| `show_spot()` | `Merchant.50.js` | Shows the saved merchant spot. |
| `enableFishingMining()` | `Merchant.50.js` | Toggles fishing/mining automation. |
| `reset_upgrade_loop(s, ss, mil)` | `Merchant.50.js` | Resets merchant upgrade loop settings. |
| `toggle_merchant_support()` | `Merchant.50.js` | Toggles active merchant party support mode. |
| `set_merchant_follow_target(name)` | `Merchant.50.js` | Sets which character the merchant follows while supplying potions. |
| `toggle_follow_flag()` | `Layout.21.js` | Toggles follow behavior flag. |

## Merchant Potion Supply

`Merchant.50.js` can keep the merchant active with the party when support mode is enabled. Use the top button named `Support` or call `toggle_merchant_support()`.

1. Follows `merchant_follow_target`, which defaults to `w` / `FTDWarrior`.
2. Opens a merchant stand when close enough to the target.
3. Lists `hpot0` in `trade1` and `mpot0` in `trade2`.
4. Restocks potions from town when merchant supply falls below the configured minimum.

Fighter potion handling in `Inventory.11.js` now tries the merchant first when low on potions. If `BotMerchant` is not visible, not standing, too far away, or not listing the needed potion, the fighter falls back to the existing town potion run.

Current merchant supply settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `isMerchantSupportEnabled` | `false` | Controls whether support mode is active. |
| `merchant_follow_target` | `w` | Character the merchant follows. |
| `merchant_follow_distance` | `150` | Distance at which the merchant stops moving and opens shop. |
| `merchant_hp_pot_price` | `50` | Price for `hpot0` in the merchant stand. |
| `merchant_mp_pot_price` | `50` | Price for `mpot0` in the merchant stand. |
| `merchant_supply_min_count` | `100` | Merchant restocks when below this many potions. |
| `merchant_supply_restock_amount` | `1000` | Amount the merchant buys from town during restock. |

## Important Character Names

These are currently configured in `Inventory.11.js`:

| Variable | Character |
| --- | --- |
| `w` | `FTDWarrior` |
| `p` | `BotPriest` |
| `r` | `BotRanger` |
| `m` | `BotMerchant` |

If character names change, update both the code and this guide.

## Load Order Notes

Adventure Land's `load_code()` calls depend on code names, not the full filenames.

Examples:

```js
load_code("Master")
load_code("Inventory")
load_code("Location")
```

When adding a new shared file:

1. Put reusable behavior in a utility or skill file.
2. Add `load_code("Name")` to the files that need it.
3. Add the new file to this guide.
4. Add the important commands/functions to the table above.

## Update Checklist

When changing the codebase, update this guide if any of these happen:

1. A file is added, renamed, removed, or repurposed.
2. A command is added that should be remembered later.
3. A function becomes the preferred way to do something.
4. Character names, farm names, party behavior, or merchant behavior changes.
5. A function is deprecated or should no longer be used.
