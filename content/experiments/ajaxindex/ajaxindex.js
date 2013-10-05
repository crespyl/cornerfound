var container = '#directory-root .tree-contents';
var mediaRoot = 'content/experiments/ajaxindex/media';

$.fn.extend({
    treeToggle: function() {
	var t = $(this[0]);
	t.toggleClass('tree-closed');
	t.children('.tree-contents').slideToggle();
    } 
});

function init() {
    load_dir_index(
	$(container),
	'Root',
	mediaRoot);
}

function setup_tree_load_events(domNode) {
    domNode.children('.tree-label').on('click', function(evt) {
	evt.preventDefault();

	var t = $(this);
	var p = t.parent();
	var c = t.next('.tree-contents');

	p.addClass('loading');
	t.off('click');
	t.on('click', function() { p.treeToggle(); } );
	c.empty();

	load_dir_index(
	    c,
	    p.data('name'), 
	    p.data('path')
	);
	p.removeClass('unloaded');

	return false;
    });
}

function load_dir_index(domNode, name, path) {
    api.get_json('dir-index',
		 { dir: path, depth: 5 },
		 function(data) {
		     for( var dir in data.contents.subdirs ) {
			 domNode.append( make_tree_node(dir, 
							path+'/'+dir,
							data.contents.subdirs[dir] 
						       ));
		     }
		     for( var i in data.contents.files ) {			 
			 domNode.append( make_tree_leaf(data.contents.files[i],
							path+'/'+data.contents.files[i]
						       ));
		     }
		     setup_tree_load_events(domNode.find('.unloaded'));
		     domNode.parent().removeClass('loading');
		 });
}

function make_tree_node(name, path, data) {
    var	template = $( '<li data-name="'+name+'" '
		      +'class="tree tree-node tree-closed" '
		      +'data-path="'+path+'"></li>');
    var contents = $('<ul class="tree tree-contents"></ul>');
    var label = make_tree_label(name, path);

    if( data.subdirs === undefined )
	template.addClass('unloaded');
    else
	for(var dname in data.subdirs) {
	    var dir = data.subdirs[dname];
	    if( dir == '.' || dir == '..' )
		continue;
	    contents.append( make_tree_node(dname, path+'/'+dname, dir) );
	}

    for(var i in data.files) {
	var file = data.files[i];
	contents.append( make_tree_leaf(file, path+'/'+file) );
    }

    label.on('click', function(evt) {
	$(this).parent().treeToggle();
    });
    contents.hide();
    template.append( label );
    template.append( contents );
    return template;
}

function make_tree_leaf(name, path) {
    var template = '<li class="tree tree-node tree-leaf"></li>';
    template = $(template);
    template.append( make_tree_label(name, path) );
    return template;
}

function make_tree_label(name, path) {
    var template = '<div class="tree tree-label">'
	+'<span class="icon glyphicon glyphicon-folder-open"></span>'
	+'<span class="icon glyphicon glyphicon-folder-close"></span>'
	+'<span class="name">{{NAME}}</span>'
	+'</div>';
    template = template.replace('{{NAME}}', name);
    template = $(template);
    return $(template);
}

$(function() {
    init();
});
