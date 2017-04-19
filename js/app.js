var map;

// Data 2 Visualize in Map ...
var museums = [
  {title: "Museo Nacional del Prado", lat: 40.413722, lng: -3.692412},
  {title: "Museo de Historia de Madrid", lat: 40.4259, lng: -3.70074},
  {title: "Museo Thyssen-Bornemisza", lat: 40.416111, lng: -3.695}, 
  {title: "Museo Reina Sofía", lat: 40.408889, lng: -3.694444},
  {title: "Museo de Arte Contemporáneo de Madrid", lat: 40.427852, lng: -3.710681},
  {title: "Museo Nacional de Antropología de Madrid", lat: 40.407694, lng: -3.688975}
];

// Object Musem ...
var Museum = function(data){
  var self = this;
  self.title = data.title;
  self.lat = data.lat;
  self.lng = data.lng;
  self.show = ko.observable(true);
  self.infoMuseum = data.title;
  self.infoWindow = new google.maps.InfoWindow({
    content: '<div>' + self.infoMuseum + '</div>'
  });

  // GOOGLE PHOTO REFERENCE
  var photoURL = 'https://maps.googleapis.com/maps/api/streetview?size=300x150&location='+ data.lat + ',' + data.lng + '&fov=90&heading=235&pitch=10&key=AIzaSyAKF6HT0C44x_nQ3pf5jHNY0qRUXdg7fNk';

  // WikiPedia API
  var titleSearch = data.title.replace(" ", "%20");
  var wikiUrl = 'http://es.wikipedia.org/w/api.php?action=opensearch&search=' + titleSearch + '&format=json&callback=wikiCallback';
  var wikiRequestTimeout = setTimeout(function(){
        self.infoMuseum = '<div> Not wikipedia info available for ' + self.title + ' ...</div>';
        self.infoWindow.setContent(self.infoMuseum);
  }, 8000);

  $.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    jsonp: "callback",
    success: function(response) {
      console.log(response);
      console.log(response[3]);
      var museumURL = response[3];
      console.log(museumURL);
      if(museumURL!=""){
        self.infoMuseum = '<div><a href="' + museumURL + '">'  + data.title + '</a></div>';
        self.infoMuseum = self.infoMuseum + '<div><img src="' + photoURL + '"></div>';
      }
      else{self.infoMuseum = '<div>' + data.title + '</div><div>Info Not Available in WikiPedia ...</div>';}
      self.infoWindow.setContent(self.infoMuseum);
      clearTimeout(wikiRequestTimeout);
    }
  });

  self.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.lng),
    map: map,
    title: data.title
  });

  self.showMuseum = ko.computed(function(){
    if(self.show()){self.marker.setMap(map);}
    else{self.marker.setMap(null);}
    return true;
  }, this);

  
  self.marker.addListener('click', function(){
    self.infoWindow.setContent(self.infoMuseum);
    self.infoWindow.open(map, this);
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          self.marker.setAnimation(null);
      }, 2100);
  });

  self.bounce = function(place) {
    google.maps.event.trigger(this.marker, 'click');
  };
};     

// KnockOut Model - View - Octopus ...
function AppViewModel() {
  // Plaza de Cibeles Center Map ...
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 40.419272, lng: -3.693125},
          zoom: 15
  });

  // Show Museums locations ...
  var self = this;
  self.museumsList = ko.observableArray([]);
  self.museum2Search = ko.observable("");

  // Add museums into map ...
  museums.forEach(function(museum){
    self.museumsList.push(new Museum(museum));
  });

  // 
  self.museums2Search = ko.computed(function() {
    var museum2Filter = self.museum2Search().toLowerCase();
    if (!museum2Filter) {
      self.museumsList().forEach(function(museum){
        museum.show(true);
      });
      return self.museumsList();
    } else {
      return ko.utils.arrayFilter(self.museumsList(), function(museum) {
        var string = museum.title.toLowerCase();
        var result = (string.search(museum2Filter) >= 0);
        museum.show(result);
        return result;
      });
    }
  }, self);

  self.mapElem = document.getElementById('map');
  self.mapElem.style.height = window.innerHeight - 50;
}

// InitMap called from HTML ...
function initMap() {
  ko.applyBindings(new AppViewModel());
}

// Error Handling Google´s Map ...
function mapLoadException() {
  alert("It seems your internet connection has an issue ...");
}
