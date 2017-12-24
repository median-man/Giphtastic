// initial topics - must be lower case
const topics = ['flying circus', 'star wars', 'dune', 'willow', 'mad max'];

// store current topic
let currentTopic;

/*
  giphy object
  ------------------------------------------------------------------

  Contains properties and methods for accessing the giphy api
*/
const giphy = {
  // --- giphy properties --- //

  // giphy search api parameters
  apiKey: 'f3971dc19c6240feab39b26de85716d1',
  hostUrl: 'https://api.giphy.com',
  limit: 10,
  ratingLimit: 'pg-13',

  // --- giphy methods --- //

  search(searchString) {
    // Returns $.ajax() call to giphy search api. Returns
    // false if searchString is invalid or undefined.
    // Paremeters:
    // searchString - word or phrase to search for

    const searchPath = '/v1/gifs/search?';
    let queryURL = 'https://api.giphy.com/v1/gifs/search?';

    // stop execution and return false if searchString is
    // invalid
    if (typeof searchString !== 'string'
      || searchString.length === 0) {
      return false;
    }

    // add query parameters to url
    queryURL += $.param({
      api_key: this.apiKey,
      q: searchString,
      limit: this.limit,
      rating: this.ratingLimit,
    });

    // send ajax request and return it
    return $.ajax({
      url: queryURL,
      method: 'GET',
    });
  },
};
/*
  giffery object
  ------------------------------------------------------------------

  Contains properties and methods for displaying and interacting
  with gifs.
*/
const giffery = {
  // --- properties --- //

  // image states
  stateStill: 'still',
  stateAnimated: 'animated',

  gifferyId: '#giffery',

  // --- methods --- //

  handleClick(event) {
    // handles clicks on the #giffery element

    // toggle gif state if an img is clicked
    if (event.target.tagName === 'IMG') {
      giffery.toggleGif(event.target);
    }
  },
  newFigure(images, rating) {
    // Returns jquery figure element containing an image with rating

    // Parameters:
    // images - object returned from giphy api
    // rating - string for image rating

    const animatedUrl = images.fixed_height.url;
    const stillUrl = images.fixed_height_still.url;

    // return a new html figure element
    return $('<figure>')
      // append new image inside a div
      .append($("<div class='gif-container'>").append($('<img>').attr({
        src: stillUrl,
        alt: $('#giffery').attr('data-topic'),
        'data-state': this.stateStill,
        'data-still': stillUrl,
        'data-animate': animatedUrl,
      })))
      // append rating to figure
      .append($('<figcaption>')
        .html(`Rating: <span class='rating'>${rating
        }</span>`));
  },
  render(giphyData) {
    // Renders images in giphyData and scrolls to giffery on small screens
    // Parameters:
    // giphyData - object returned by giphy search api

    /*
    TODO:
      Create methods in giphy object for accessing the data
      in the object returned by the api to decouple the
      giffery from the giphy api schema. This will make
      maintaining the app easier if the giphy api is changed
      in the future.
    */

    const data = giphyData.data;
    const $giffery = $(giffery.gifferyId);

    // clear #giffery
    $giffery.fadeTo(200, 0, () => {
      $giffery.empty().css('opacity', 1);

      // apend images in #giffery for each gif with image in a
      // static (as opposed to animated) state
      for (let i = 0; i < data.length; i++) {
        // append figure to the giffery and fade in the image
        const gifRating = giphyData.data[i].rating;
        giffery.newFigure(data[i].images, gifRating)
          .hide()
          .appendTo(giffery.gifferyId)
          .css('opacity', 0)
          .fadeTo(800, 1);
      }
    });

    // scroll window to giffery if page is displayed as a single
    // column (viewport width < 449px)
    if (window.innerWidth < 550) {
      $('body').animate({
        scrollTop: $giffery.offset().top,
      });
    }
  },
  toggleGif(img) {
    // Toggles the state of img--animated/static

    // Parameters:
    // img: html img element to toggle

    const $img = $(img);

    // get the state of the image
    const state = $img.attr('data-state');

    // if the image is static
    if (state === this.stateStill) {
      // animate the image and update state
      $img.attr({
        src: $img.attr('data-animate'),
        'data-state': this.stateAnimated,
      });

      // if the image is animated
    } else if (state === this.stateAnimated) {
      // make the img static
      $img.attr({
        src: $img.attr('data-still'),
        'data-state': this.stateStill,
      });
    }
  },
};
/*
  topicButtons object
  ------------------------------------------------------------------

  Contains properties and methods for adding topics and interacting
  with the topic buttons.
*/
var topicButtons = {
  topics,
  addTopic(topic) {
    // Adds a new topic to topics

    // Parameters:
    // newTopic - string

    topic = topic.toLowerCase();

    // return false if topic has already been added or
    // topic is an empty string
    if (topic.length === 0 ||
      topics.indexOf(topic) > -1) {
      return false;
    }

    // add topic to topics and render the ubttons
    this.topics.unshift(topic);
    this.render();
  },
  getBtnTopic(btnElement) {
    // returns the topic of the btnElement
    return $(btnElement).attr('data-topic');
  },
  newButton(topic, isCurrent) {
    // Returns a jQuery object for a topic button
    // Paremeters:
    // topic - string for the topic of the button
    // isCurrent - boolean indicator for current topic

    let classes = 'u-full-width';
    const clsCurrentTopic = 'button-primary';

    // apply currentTopic class if topic is the current topic
    if (isCurrent) {
      classes += ` ${clsCurrentTopic}`;
    }

    // create button
    return $('<button>')
      .addClass(classes)
      .text(topic)
      .attr('data-topic', topic);
  },
  render() {
    // Renders topic buttons from topics array

    let classes;

    // clear buttons
    $('#buttonBox').empty();

    // add a button to #buttonBox for each topic
    this.topics.forEach((topic) => {
      // create button and add it to button box
      topicButtons.newButton(topic, topic === currentTopic)
        .appendTo('#buttonBox');
    });
  },
};

$(document).ready(() => {
  // display topic buttons
  topicButtons.render();

  // listen for click on #buttonBox
  $('#buttonBox').on('click', handleTopicSelection);

  // listen for click on #giffery
  $('#giffery').on('click', giffery.handleClick);

  // listen for click on #btnAddTopic
  $('#btnAddTopic').on('click', (event) => {
    event.preventDefault();

    // get the topic from the form and add it to the buttons
    topicButtons.addTopic($('#txtAddTopic').val());

    // clear input from form
    $('#txtAddTopic').val('');
  });

  function handleTopicSelection(event) {
    // Sends request to giphy api for gifs and renders them

    // get the topic of the button that was clicked
    const topic = topicButtons.getBtnTopic(event.target);

    // update #giffery topic attribute
    $('#giffery').attr('data-topic', topic);

    // update currentTopic
    currentTopic = topic;

    // get gif data from giphy api and render the topic buttons
    giphy.search(topic).done(giffery.render);
    topicButtons.render();
  }
});
