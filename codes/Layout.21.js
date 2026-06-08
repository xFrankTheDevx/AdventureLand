function toggle_follow_flag() {
  if (localStorage.getItem("follow_flag") == "0")
  {
	  console.log('following')
	  localStorage.setItem("follow_flag", 1);
  }
  else {
	  localStorage.setItem("follow_flag", 0);
	  console.log('stopped following');
  }
}

add_bottom_button("follow_flag", "🛴", toggle_follow_flag);
