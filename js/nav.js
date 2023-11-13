"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Show submit form on click on "submit" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $storyForm.show();
}

$navSubmit.on("click", navSubmitClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navCenter.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When a user clicks on favorites, show their favorite stories */

function navFaveStories(evt) {
  console.debug("navFaveStories", evt);
  hidePageComponents();
  putFavoritesOnPage();
}

$navFaves.on("click", navFaveStories);

//** When a user clicks on mine, show them their submitted stories */

function navMine(evt) {
  console.debug("navMine", evt)
  hidePageComponents();
  putMyStoriesOnPage();
}

$navMine.on("click", navMine);