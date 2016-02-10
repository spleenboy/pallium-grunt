var util  = require('util');
var spawn = require('child_process').spawn;

var plugins = require(process.cwd() + '/app/services/plugins');
var log    = plugins.require('services/log')(module);
var config = plugins.require('config');
var View   = plugins.require('views/view');
var Parent = plugins.require('controllers/controller');

function Controller() {
    Parent.call(this);
    this.viewBase = process.cwd() + '/plugins/grunt/views';
}

util.inherits(Controller, Parent);


Controller.prototype.exec = function() {
    var tasks = config.get('grunt.tasks');
    var task  = tasks[this.request.params.task];

    if (!task) {
        return this.sendError(404);
    }

    var io   = this.app.io;
    var cast = io.emit.bind(io, 'flash');
    var done = io.emit.bind(io, 'flash', task.done);
    var err  = io.emit.bind(io, 'flash', task.error);

    var grunt = spawn('grunt', task.args, task.options);

    grunt.stderr.on('data', function(data) {
        log.error('Error running task', task, data);
    });

    grunt.on('close', function(code) {
        if (code === 0) {
            done();
        }
        else {
            error();
        }
    });

    var data = {'task': task};
    this.send('task', data);
};

module.exports = Controller;
