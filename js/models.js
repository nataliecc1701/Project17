"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // quick and ugly parse of the URL. should probably learn regex to do this better
    // we want to truncate the beginning up the the last / before a . and the first / after
    let seenDot = false;
    let hostName = "";

    if (typeof this.url != "string") console.log(storyList.stories);
    for(let char of this.url) {
      if (!seenDot) {
        if (char === "/") {
          hostName = "";
        }
        else {
          hostName += char;
          if (char === ".") {
            seenDot = true;
          }
        }
      }
      else {
        if (char === "/") {
          break;
        }
        else {
          hostName += char;
        }
      }
    }

    // remove "www." from 
    if (hostName.slice(0,4) === "www.") {
      hostName = hostName.replace("www.", "")
    }
    return hostName;
  }

  /** check to see if the story is one of the current user's favorites */

  getIsFavorite() {
    if (!currentUser) return;

    if(currentUser.favorites.some(f => f.storyId == this.storyId)) {
      return true;
    }
    return false;
  }

  /** get if the story was posted by the user */

  getIsMine( user ) {
    if (!user) return false;
    return (this.username === user.username);
  }

  /** 
   * remove the story from the database and the storyList object 
   * */

  async removeStory( user ) {
    const response = await axios.delete(`${BASE_URL}/stories/${this.storyId}`,
    {data : {token : user.loginToken}});

    if (response.status === 200) {
      const idx = storyList.stories.indexOf(this);
      storyList.stories.splice(idx, 1);
      
      const faveIdx = user.favorites.indexOf();
      user.favorites.splice(faveIdx, 1);

      const subsIdx = user.ownStories.indexOf();
      user.ownStories.splice(subsIdx, 1);
    }
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // STUDENT ANSWER: because getStories is called during construction to call the
    // constructor, right? because constructors can't be async.

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory( user, newStory ) {
    const response = await axios.post(`${BASE_URL}/stories`, {
      token : user.loginToken,
      story : newStory
    });

    if (response.status === 201) {
      const added = new Story(response.data.story);
      this.stories.unshift(added);
      user.ownStories.push(added);
      return added; 
    }
    else {
      return null;
    }   
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  

  /** add a story as a favorite */

  async addFavorite(story) {
    console.debug(`addFavorite: ${story.storyId}`);
    const response = await axios.post(
      `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      {token: currentUser.loginToken}
    )
    
    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      currentUser.loginToken // it took me _so much_ to debug this
      // the API docs say that they send back the whole user document but not, apparently
      // the login token, so copy-pasting the code for logging in doesn't work
    )
  }

  async removeFavorite(story) {
    console.debug(`removeFavorite: ${story.storyId}`);
    const response = await axios.delete(
      `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      {data : {token: currentUser.loginToken} }
    )
    
    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      currentUser.loginToken
    )
  }
}
