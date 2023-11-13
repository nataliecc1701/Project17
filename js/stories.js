"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/** 
 * Generates the star used to show if a story is favorited or not
 */

function getFaveStar(story) {
  if (!currentUser) return "";

  // shamelessly copying the html for the stars from the example
  if (story.getIsFavorite()) {
    return "<span class='star'><i class='fa-star fas'> </i></span>"
  }
  else return "<span class='star'><i class='fa-star far'> </i></span>"
}

/**
 * Checks to see if the story is yours and if it is, provides html for a trash can
 */

function getTrashCan(story) {
  if(story.getIsMine(currentUser)) {
    return "<span class='trash-can'><i class='fa fa-trash-o'></i></span>";
  }
  return "";
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const faveStar = getFaveStar(story);
  const trashCan = getTrashCan(story);
  return $(`
      <li id="${story.storyId}">
        ${faveStar} ${trashCan}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <strong class="story-author">by ${story.author}</strong>
        <span class="story-user">posted by ${story.username}</span>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** handles clicks on favorite stars */
async function faveStarClick(evt) {
  console.debug("faveStarClick");
  
  const id = evt.target.parentElement.parentElement.id;
  const story = storyList.stories.filter(s => s.storyId === id)[0]
  if (!story.getIsFavorite()) {
    currentUser = await currentUser.addFavorite(story);
    evt.target.classList.replace('far', 'fas');
  }
  else {
    currentUser = await currentUser.removeFavorite(story);
    evt.target.classList.replace('fas', 'far');
  }
}

$allStoriesList.on("click", ".fa-star", faveStarClick);

/** 
 * click the trash can to prompt to remove a story 
 * */

async function trashCanClick(evt) {
  console.debug("trashCanClick");

  const id = evt.target.parentElement.parentElement.id;
  const story = storyList.stories.filter(s => s.storyId === id)[0]
  const storyTitle = story.title;

  if (confirm(`Delete your posted story ${storyTitle}?`)) {
    await story.removeStory(currentUser);
    if (showing === "mine") {putMyStoriesOnPage()}
    else if (showing === "favorites") {putFavoritesOnPage()}
    else {putStoriesOnPage()}
  }
}

$allStoriesList.on("click", ".fa-trash-o", trashCanClick);

/** puts favorite stories on the page
 * uses the same container as the all stories list
 */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** put stories posted by user on page */

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Sends a story to the server and puts it on the page if it posts correctly */

async function sendStoryToServer(evt) {
  evt.preventDefault(); // this function is called as an event listener
  // this shouldn't be called if you're not logged in but just in case
  if(!currentUser) {return}

  console.debug("sendStoryToServer");
  const author = $("#submission-author").val();
  const title = $("#submission-title").val();
  const url = $("#submission-url").val();
  const story = {author, title, url};

  $submitMessage.text("Submitting...");
  $submitMessage.show();
  try {
    const response = await storyList.addStory(currentUser, story);
    putStoriesOnPage();
    $storyForm.hide();
    $submitMessage.text("");
    $submitMessage.hide();
  }
  catch(err) {
    console.log(err);
    $submitMessage.text("Story submission failed");
  }
}

$storyForm.on("submit", sendStoryToServer);