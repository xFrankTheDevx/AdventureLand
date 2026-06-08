last_use_energize = null;
function mage_logic() {
  if (character.party == null) return;
  var party = Object.keys(parent.party);
  for (let i in party) {
    var player = get_player(party[i]);
    if (player == null || player.rip) continue;
    var player_mp_pct = (player.mp / player.max_mp) * 100;
    if (player_mp_pct < 50) {
      if (character.mp > 500) {
        var skill = parent.G.skills.energize;
        if (
          last_use_energize == null ||
          new Date() - last_use_energize > skill.cooldown
        ) {
          use_skill("energize", player);
          last_use_energize = new Date();
        }
      }
    }
  }
}
