var map;

// Data 2 Visualize in Map ...
var museums = [
  {title: "Museo Nacional del Prado", lat: 40.413722, lng: -3.692412},
  {title: "Museo de Historia de Madrid", lat: 40.4259, lng: -3.70074},
  {title: "Museo Thyssen-Bornemisza", lat: 40.416111, lng: -3.695}, 
  {title: "Museo Reina Sofía", lat: 40.408889, lng: -3.694444},
  {title: "Museo de Arte Contemporáneo de Madrid", lat: 40.427852, lng: -3.710681},
  {title: "Museo Nacional de Antropología de Madrid", lat: 40.407694, lng: -3.688975},
  {title: "Museo Cerralbo", lat: 40.423684, lng: -3.714577},
  {title: "Museo Sorolla", lat: 40.435404, lng: -3.692539},
  {title: "Museo Romanticismo Madrid", lat: 40.425869, lng: -3.698839},
  {title: "Museo de América Madrid", lat: 40.438131, lng: -3.722069},
  {title: "Museo del Traje Madrid", lat: 40.44, lng: -3.728611},
  {title: "Museo Lázaro Galdiano", lat: 40.448189, lng: -3.683594},
  {title: "Museo del Ferrocarril Madrid", lat: 40.398333, lng: -3.694167},
  {title: "Museo del Aire Madrid", lat: 40.368744, lng: -3.80085},
  {title: "Museo Naval Madrid", lat: 40.417456, lng: -3.692804},
  {title: "Museo del Aire Madrid", lat: 40.368744, lng: -3.80085},
  {title: "Real Academia de Bellas Artes", lat: 40.418056, lng: -3.700278}
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
      var museumURL = response[3];
      if(museumURL!=""){
        self.infoMuseum = '<div>'  + data.title + '</div>';
        self.infoMuseum = self.infoMuseum + '<div><a href="' + museumURL + '" alt="' + data.title + '"><img src="' + photoURL + '"></a></div>';
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
          zoom: 13
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
