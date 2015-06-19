var path = require('path');

var config          = plugin('config');
var View            = plugin('views/view');
var Controller      = plugin('controllers/controller');
var GruntController = require('./controller');

var id = 'grunt';

module.exports = function(hooks, app) {
    var data = config.get('grunt');

    hooks.on('app/controllers/controller/populating', function(event) {
        var view = new View('menu', data);
        view.base = path.join(__dirname, 'views');
        var content = view.render();
        event.data.sidebar[id] = content;
    });

    hooks.on('app/bootstrap/routes/registering', function(event) {
        var router  = new event.express.Router();
        var factory = new Controller.Factory(GruntController, event.app);

        router.get('/:task', factory.handle('exec'));

        event.routers[id] = router;
    });
};
