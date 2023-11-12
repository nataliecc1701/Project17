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
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
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
  catch {
    $submitMessage.text("Story submission failed");
  }
}

$storyForm.on("submit", sendStoryToServer);