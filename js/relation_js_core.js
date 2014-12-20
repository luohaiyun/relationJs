/*
 * JQuery relation core v1.0
 *
 * Copyright (c) 2014 luo
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: luohaiyun@outlook.com
 * Date: 2014-12-15
 */
(function($) {
	var _setting = {
		view : {
			txtSelectedEnable: true, 
			autoCancelSelected : true,
			selectedMulti : true,
			showIcon : true,
			showTitle : true
		},
		data : {
			key : {
				parent : "parent",
				name : "name",
				id : 'id',
				title : "",
				url : "url"
			}
		},
		callback : {
			beforeClick : function(event, obj, node) {
			},
			beforeDblClick : function(event, obj, node) {
			},
			beforeRightClick : function(event, obj, node) {
			},
			beforeMouseDown : function(event, obj, node) {
			},
			beforeMouseUp : function(event, obj, node) {
			},
			beforeMouseOver: function(event, obj, node){
			},
			beforeMouseOut: function(event, obj, node){
			},
			beforeRemove : function(obj, node) {
			},

			onNodeCreated : function(obj, node) {
			},
			onClick : function(event, obj, node) {
			},
			onDblClick : function(event, obj, node) {
			},
			onRightClick : function(event, obj, node) {
			},
			onMouseDown : function(event, obj, node) {
			},
			onMouseUp : function(event, obj, node) {
			},
			onMouseOver: function(event, obj, node){
			},
			onMouseOut: function(event, obj, node){
			},
			onRemove : function(obj, node) {
			}
		}
	}, _consts = {
		className: {
			LINE: "line"
		},
		event : {
			NODECREATED : '_nodeCreated',
			CLICK : '_click',
			RESIZE : '_resize',
			INIT : '_init',
			LINK : '_link',
			REMOVE: '_remove',
			SHOWLINE: '_showline'
		},
		id : {
			A : '_a',
			ICON : '_icon',
			SPAN : '_span',
			UL : '_ul',
			LINE: '_line',
			ROOT : '_root_relation',
			SETTING : '_setting_relation',
			CACHE : '_cache_relation',
		},
		line : {
			UNSELECTED_COLOR: 'green',
			UNSELECTED_WIDTH: 1,
			SELECTED_COLOR: 'blue',
			SELECTED_WIDTH: 5,
			OFFSET_TOP : 40,
			OFFSET_LEFT : 40
		},
		node : {
			CURNODESELECTED: 'selected'
		}
	}, _view = {
		destroy : function(obj) {
			_data.initCache(obj);
			_data.initRoot(obj);
			_event.unbindRelation(obj);
			_event.unbindEvent(obj);
			$(obj).empty();
		},
		createNodes : function(obj, nodes) {
			var me = $(obj);
			if (!nodes || nodes.length == 0)
				return;
			var root = _data.getRoot(obj);
			root.createdNodes = [];
			var nodeshtml = _view.appendNodes(obj, nodes);
			me.append(nodeshtml.join(''));
			_view.createNodeCallback(obj);
		},
		appendNodes : function(obj, nodes) {
			if (!nodes)
				return [];
			var html = [];
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				node['r_node'] = _tools.getUid();
				_data.initNode(obj, node);
				_data.addNodeCache(obj, node);
				_view.makeDOMNodeMainBefore(html, obj, node);
				_data.getBeforeA(obj, node, html);
				_view.makeDOMNodeNameBefore(html, obj, node);
				_data.getInnerBeforeA(obj, node, html);
				_view.makeDOMNodeNameMain(html, obj, node);
				_data.getInnerAfterA(obj, node,html);
				_view.makeDOMNodeNameAfter(html, obj, node);
				_view.makeDOMNodeMainAfter(html, obj, node);
				_data.getAfterA(obj, node, html);
				_data.addCreateNode(obj, node);
			}
			return html;
		},
		makeDOMNodeMainBefore : function(html, obj, node) {
			html.push("<div hidefocus=\'true\' r_node='", node['r_node'], "'>");
		},
		makeDOMNodeMainAfter : function(html, obj, node) {
			html.push("</div>");
		},
		makeDOMNodeNameBefore : function(html, obj, node) {
			var title = _data.getNodeTitle(obj, node);
			var url = _data.getNodeUrl(obj, node);
			var setting = _data.getSetting(obj);
			html.push("<a ", _consts.id.A, "  onclick=\"",
					(node.click || ''), "\" ",
					(url != null && url.length > 0) ? "href=\'" + url + "'"
							: "", " target='", _view.makeNodeTarget(node), "'");
			if (_tools.apply(setting.view.showTitle, [ obj, node ],
					setting.view.showTitle)
					&& title) {
				html.push("title='", title.replace(/'/g, "&#39;").replace(/</g,
						'&lt;').replace(/>/g, "&gt;"), "'");
			}
			html.push(" >");
		},
		makeDOMNodeNameMain : function(html, obj, node) {
			_view.makeDOMNodeIcon(html, obj, node);
			html.push("<span ", _consts.id.SPAN,
						">", _data.getNodeName(obj, node) ,"</span>");
		},
		makeDOMNodeIcon: function(html, obj, node){
			html.push("<span ",_consts.id.ICON," style='"
					, _view.makeNodeIcoStyle(obj,node),"'></span>");
		},
		makeNodeIcoStyle: function(obj, node){
			var iconStyle = [];
			var setting = _data.getSetting(obj);
			if (node.icon) iconStyle.push("background:url(", node.icon, ") 0 0 no-repeat;");
			if (setting.view.showIcon == false || 
					!_tools.apply(setting.view.showIcon, [obj, node], true)) {
				icoStyle.push("width:0px;height:0px;");
			}
			return iconStyle.join('');
		},
		makeDOMNodeNameAfter : function(html, obj, node) {
			html.push("</a>");
		},
		makeNodeTarget : function(node) {
			return (node.target || "_blank");
		},
		createNodeCallback : function(obj) {
			var setting = _data.getSetting(obj);
			if (!!setting.callback.onNodeCreated) {
				var root = _data.getRoot(obj);
				while (root.createdNodes.length > 0) {
					var node = root.createdNodes.shift();
					$(obj).trigger(_consts.event.NODECREATED, [ obj, node ]);
				}
			}
			$(obj).trigger(_consts.event.INIT, [ obj ]);
		},
		makeRelationNodes : function(event, obj) {
			var nodes = _data.getCache(obj).nodes;
			var setting = _data.getSetting(obj);
			var r_storage = [];
			var r_nodes = _data.filterRootNodes(setting, nodes);
			r_storage.push([ r_nodes ]);
			_view.makeLevelNodes(setting, r_storage, nodes);
			_view.makeNodesToPage(obj, r_storage, setting, nodes);
			_view.moveNodeDomToTarget(obj);
			$(obj).trigger(_consts.event.LINK, [ obj ]);
		},
		makeLevelNodes : function(setting, rStorage, nodes) {
			var root = rStorage[rStorage.length - 1];
			var tData = [];
			function getTdata(str1, pKey) {
				var chils = _tools.getChilds(str1, pKey, nodes);
				if (chils.length > 0)
					tData.push(chils);
			}
			for ( var key in root) {
				for ( var _k in root[key]) {
					if ($.isArray(root[key][_k])) {
						for ( var rKey in root[key][_k]) {
							getTdata(root[key][_k][rKey][setting.data.key.id],
									setting.data.key.parent);
						}
					} else {
						getTdata(root[key][_k][setting.data.key.id],
								setting.data.key.parent);
					}
				}
			}
			if (tData.length < 1)
				return;
			rStorage.push(tData);
			_view.makeLevelNodes(setting, rStorage, nodes);
		},
		makeNodesToPage : function(obj, r_storage, setting, nodes) {
			if (!r_storage || r_storage.length < 1)
				return;
			var me = $(obj);
			function _draw(_node, html) {
				if ($("li[r_node='" + _node['r_node'] + "']", obj).length > 0)
					throw "can't create";
				var nParent = $.isArray(_node[setting.data.key.parent]) ? _node[setting.data.key.parent]
						: [ _node[setting.data.key.parent] ];
				var isAppend = true;
				for ( var pKey in nParent) {
					var n = _tools.getNodeByKey(nParent[pKey],
							setting.data.key.id, nodes);
					if (!n)
						break;
					if ($("li[r_node='" + n['r_node'] + "']", obj).length < 1)
						isAppend = false;
				}
				if (!isAppend)
					throw "can't create";
				_view.makeNodesToPageBefor(_node, html);
				_view.makeNodesToPageMain(_node, html);
				_view.makeNodesToPageAfter(html);
			}
			var added = {};
			var level = 0;
			for ( var key in r_storage) {
				var html = [];
				for ( var nKey in r_storage[key]) {
					for ( var _nKey in r_storage[key][nKey]) {
						if (added[r_storage[key][nKey][_nKey]['r_node']])
							continue;
						try {
							_draw(r_storage[key][nKey][_nKey], html);
							added[r_storage[key][nKey][_nKey]['r_node']] = $.noop;
						} catch (e) {
						}
					}
				}
				if (html.length > 0) {
					var ul = _view.makeNodesToPageMainBefor(level
							+ _consts.id.UL, me);
					ul.append(html.join(''));
				}
				level++;
			}
		},
		moveNodeDomToTarget : function(obj) {
			$("div[r_node]", obj).each(
					function() {
						$("li[r_node='" + $(this).attr('r_node') + "']", obj)
								.append(this);
					});
		},
		makeNodesToPageBefor : function(node, html) {
			html.push("<li r_node='", node['r_node'], "'>");
		},
		makeNodesToPageMain : function(node, html) {
		},
		makeNodesToPageAfter : function(html) {
			html.push("</li>");
		},
		makeNodesToPageMainBefor : function(level, obj) {
			var ul = $("ul[level=" + level + "]", obj);
			if (ul.length > 0)
				return ul;
			return $("<ul level='" + level + "'></ul>").appendTo(obj);
			// add switch button
		},
		makeNodesLineToPage : function(event, obj) {
			var me = $(obj), setting = _data.getSetting(obj), caches = _data
					.getCache(obj)['nodes'];
			for ( var cKey in caches) {
				var cache = caches[cKey];
				var parents = $.isArray(cache[setting.data.key.parent]) ? cache[setting.data.key.parent]
						: [ cache[setting.data.key.parent] ];
				for ( var pKey in parents) {
					var parent = _tools.getNodeByKey(parents[pKey],
							setting.data.key.id, caches);
					if (parent)
						_view.makeNodeLineToPage(caches[cKey], parent, obj);
				}
			}
		},
		makeNodeLineToPage : function(src, target, obj) {
			// 重新改造
			var position = [], div = $("."+_consts.className.LINE, obj), line = $(
					"[from='" + src['r_node'] + "'][to='" + target['r_node']
							+ "']", div);
			_view.makeNodeLinePosition(src, target, obj, position);
			if (div.length < 1)
				div = $("<div class='"+_consts.className.LINE+"'></div>").appendTo(obj);
			_tools.drawLine(div[0], position, null, {
				from : src['r_node'],
				to : target['r_node']
			}, line);
		},
		makeNodeLinePosition : function(src, target, obj, position) {
			var sDom = $("li[r_node='" + src['r_node'] + "']", obj), tDom = $(
					"li[r_node='" + target['r_node'] + "']", obj), nodes = _data
					.getCache(obj)['nodes'], setting = _data.getSetting(obj);
			var parentIds = $.isArray(src[setting.data.key.parent]) ? src[setting.data.key.parent]
					: [ src[setting.data.key.parent] ];
			var parentDom = sDom.parent(),level = parentDom.attr('level');
			//TODO有问题   这个方式也不行
			var prevDom = parentDom.siblings(
					"ul[level='" + (level.substring(0,level.lastIndexOf("_")) - 1) + _consts.id.UL + "']");
			var parentDom;
			for ( var idKey in parentIds) {
				var node = _tools.getNodeByKey(parentIds[idKey],
						setting.data.key.id, nodes);
				_parentDom = $("li[r_node='" + node['r_node'] + "']", prevDom);
				if (_parentDom.length < 1)
					continue;
				parentDom = _parentDom;
				if (_tools.eqs(tDom.attr('r_node'), parentDom.attr('r_node'))) {
					_tools.arrayPushArray(position, _tools.computedDomRange(
							sDom, parentDom));
					return;
				}
			}
			_tools.arrayPushArray(position, _tools.computedDomRange(sDom,
					parentDom));
			_view.makeNodeLinePosition(nodes[parentDom.attr('r_node')], target,
					obj, position);
		},
		removeNode : function(obj, node, own, event) {
			var setting = _data.getSetting(obj);
			if (!node) return;
			if (event && _tools.apply(setting.callback.beforeRemove, [obj, node], true) == false) return;
			_view.removeNodeChilds(obj, node, own);
			$(obj).trigger(_consts.event.REMOVE, [obj, node]);
			_view.resizeLinePosition(obj);
		},
		removeNodeChilds : function(obj, node, own) {
			var setting = _data.getSetting(obj), cache = _data.getCache(obj);
			node = cache.nodes[node['r_node']], del = [];
			$("[to='" + node['r_node'] + "']", obj).each(
					function() {
						var domId = $(this).attr('from');
						var domFrom = cache.nodes[domId];
						if (domFrom[setting.data.key.parent].length > 1) {
							delete domFrom[setting.data.key.parent][_tools
									.ArrayIndexOf(node[setting.data.key.id],
											domFrom[setting.data.key.parent])];
						} else {
							_view.removeNode(obj, domFrom, true ,false);
							$("[r_node='" + domId + "']", obj).remove();
						}
						delete this;
					});
			if (own) {
				delete cache.nodes[node['r_node']];
				$(
						"[r_node='" + node['r_node'] + "'],[from='"
								+ node['r_node'] + "']", obj).remove();
			}
		},
		resizeLinePosition : function(obj) {
			var lines = $("[to][from]", obj),
				nodes = _data.getCache(obj).nodes;
			lines.each(function() {
				var to = nodes[$(this).attr('to')], from = nodes[$(this).attr(
						'from')];
				_view.makeNodeLineToPage(from, to, obj);
			});
		},
		showNodeLine: function(obj, node, isShow){
			if(!node) return;
			var allLine = node.getNodeLine(true);
			var show = isShow ?
					{width:_consts.line.SELECTED_WIDTH,color: _consts.line.SELECTED_COLOR} 
					: {width: _consts.line.UNSELECTED_WIDTH,color: _consts.line.UNSELECTED_COLOR};
			allLine.each(function(){
				if(this.strokeweight){
					this.strokeweight = show.width+"px";
					this.strokecolor = show.color;
				}else{
					this.setAttribute("stroke-width", show.width+"px");
					this.setAttribute("stroke", show.color);
				}
			});
		},
		selectNode: function(obj, node, addFlag){
			if(!addFlag){
				_view.cancelPreSelectedNode(obj)
			}
			var setting = _data.getSetting(obj);
			$("li[r_node=" + node['r_node'] + "]", obj).addClass(
					_consts.node.CURNODESELECTED);
		},
		cancelPreSelectedNode: function(obj, node){
			$("."+_consts.node.CURNODESELECTED, obj).removeClass(_consts.node.CURNODESELECTED);
		}
	}, _data = {
		getSetting : function(obj) {
			return $.data(obj, _consts.id.SETTING);
		},
		setSetting : function(obj, setting) {
			return $.data(obj, _consts.id.SETTING, setting);
		},
		getNodeTitle : function(obj, node) {
			var setting = this.getSetting(obj);
			return node[setting.data.key.title || setting.data.key.name
					|| 'title'];
		},
		getNodeName : function(obj, node) {
			var setting = this.getSetting(obj);
			return node[setting.data.key.name] || "";
		},
		getNodeUrl : function(obj, node) {
			var setting = this.getSetting(obj);
			return node[setting.data.key.url] || "";
		},
		getRoot : function(obj) {
			return $.data(obj, _consts.id.ROOT);
		},
		setRoot : function(obj, root) {
			return $.data(obj, _consts.id.ROOT, root);
		},
		getCache : function(obj) {
			return $.data(obj, _consts.id.CACHE);
		},
		setCache : function(obj, cache) {
			return $.data(obj, _consts.id.CACHE, cache);
		},
		addCreateNode : function(obj, node) {
			var setting = _data.getSetting(obj);
			if (setting.callback.onNodeCreated) {
				var root = _data.getRoot(obj);
				root.createdNodes.push(node);
			}
		},
		addNodeCache : function(obj, node) {
			_data.getCache(obj).nodes[node['r_node']] = node;
		},
		getNodeCache: function(obj, rid){
			return _data.getCache(obj).nodes[rid];
		},
		getNodes : function(target) {
			return _tools.getObjValues(_data.getCache(target).nodes);
		},
		isSelectedNode : function(obj, node) {
			var setting = _data.getSetting(obj);
			return $("[.selected]",$("li[r_node=" + node[setting.data.key.id] + "]")).length > 0;
		},
		getNodeById : function(obj, id) {
			var nodes = _data.getCache(obj).nodes, setting = _data
					.getSetting(obj);
			for ( var k in nodes) {
				if (_tools.eqs(nodes[k][setting.data.key.id], id)) {
					return nodes[k];
				}
			}
		},
		filterRootNodes : function(setting, nodes) {
			var r_nodes = [];
			for ( var nKey in nodes) {
				if (nodes[nKey][setting.data.key.parent]) {
					if (!_tools.isExitsArray(
							nodes[nKey][setting.data.key.parent],
							setting.data.key.id, nodes)) {
						r_nodes.push(nodes[nKey]);
					}
				} else
					r_nodes.push(nodes[nKey]);
			}
			if (r_nodes.length < 1)
				throw "no root nodes can't continue";
			return r_nodes;
		},
		addAfterA: function(afterA){
			_init.afterA.push(afterA);
		},
		addBeforeA: function(beforeA) {
			_init.beforeA.push(beforeA);
		},
		addInnerAfterA: function(innerAfterA) {
			_init.innerAfterA.push(innerAfterA);
		},
		addInnerBeforeA: function(innerBeforeA) {
			_init.innerBeforeA.push(innerBeforeA);
		},
		addInitBind: function(bindEvent) {
			_init.bind.push(bindEvent);
		},
		addInitUnBind: function(unbindEvent) {
			_init.unbind.push(unbindEvent);
		},
		addInitCache: function(initCache) {
			_init.caches.push(initCache);
		},
		addInitProxy: function(initProxy, isFirst) {
			if (!!isFirst) {
				_init.proxys.splice(0,0,initProxy);
			} else {
				_init.proxys.push(initProxy);
			}
		},
		addInitNode: function(initNode) {
			_init.nodes.push(initNode);
		},
		addInitRoot: function(initRoot) {
			_init.roots.push(initRoot);
		},
		addRelationTools: function(relationTools) {
			_init.relationTools.push(relationTools);
		},
		getAfterA: function(obj, node, array) {
			for (var i=0, j=_init.afterA.length; i<j; i++) {
				_init.afterA[i].apply(this, arguments);
			}
		},
		getBeforeA: function(obj, node, array) {
			for (var i=0, j=_init.beforeA.length; i<j; i++) {
				_init.beforeA[i].apply(this, arguments);
			}
		},
		getInnerAfterA: function(obj, node, array) {
			for (var i=0, j=_init.innerAfterA.length; i<j; i++) {
				_init.innerAfterA[i].apply(this, arguments);
			}
		},
		getInnerBeforeA: function(obj, node, array) {
			for (var i=0, j=_init.innerBeforeA.length; i<j; i++) {
				_init.innerBeforeA[i].apply(this, arguments);
			}
		},
		getRelationTools: function(obj) {
			var r = this.getRoot(obj);
			return r ? r.relationTools : null;
		},
		initCache: function(obj){
			for (var i=0, j=_init.caches.length; i<j; i++) {
				_init.caches[i].apply(this, arguments);
			}
		},
		initNode: function(obj){
			for (var i=0, j=_init.caches.length; i<j; i++) {
				_init.nodes[i].apply(this, arguments);
			}
		},
		initRoot: function(obj, node) {
			for (var i=0, j=_init.roots.length; i<j; i++) {
				_init.roots[i].apply(this, arguments);
			}
		},
		setRelationTools: function(relationTools) {
			for (var i=0, j=_init.relationTools.length; i<j; i++) {
				_init.relationTools[i].apply(this, arguments);
			}
		},
		getParents: function(obj, rid){
			var setting = _data.getSetting(obj),parents = [],
				nodes = _data.getCache(obj).nodes;
			var _node = nodes[rid];
			_node = $.isArray(_node[setting.data.key.parent]) ? _node[setting.data.key.parent] : [_node[setting.data.key.parent]]
			for(var i=0;i<_node.length;i++){
				parents.push(_data.getNodeById(obj,_node[i]));
			}
			return parents;
		},
		getChilds: function(obj, rid){
			var nodes = _data.getCache(obj).nodes,
					setting=_data.getSetting(obj);
			return _tools.getChilds(nodes[rid][setting.data.key.id],setting.data.key.parent, nodes);
		},
		getPreNode: function(obj, rid){
			var nodes = _data.getCache(obj).nodes;
			var li = $("li[r_node='"+rid+"']",obj).prevAll("li[r_node]").last();
			if(li.length > 0){
				return nodes[li.attr('r_node')];
			}
			return null;
		},
		getNextNode: function(obj, rid){
			var nodes = _data.getCache(obj).nodes;
			var li = $("li[r_node='"+rid+"']",obj).nextAll("li[r_node]").first();
			if(li.length > 0){
				return nodes[li.attr('r_node')];
			}
			return null;	
		},
		getNodeLine: function(obj, rid, all){
			if(all)
				return $("[to='"+rid+"'],[from='"+rid+"']", obj);
			else
				return {
					to : $("[to='"+rid+"']", obj),
					from : $("[from='"+rid+"']", obj) 
				}
		},
		getNodesByParam: function(key,value,nodes,fuzzy,rids){
			if (!nodes || !key) return [];
			var result = [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if(fuzzy){
					if (typeof nodes[i][key] == "string" && nodes[i][key].toLowerCase().indexOf(value)>-1 
							&& !rids[nodes[i]['r_node']]) {
						result.push(nodes[i]);
						rids[nodes[i]['r_node']]=true;
					}
				}else{
					if (nodes[i][key] == value && !rids[nodes[i]['r_node']]) {
						result.push(nodes[i]);
						rids[nodes[i]['r_node']]=true;
					}
				}
				result = result.concat(_data.getNodesByParam(key, value,nodes[i].getChilds(),fuzzy,rids));
			}
			return result;
		}
	}, _event = {
		bindEvent: function(obj) {
			for (var i=0, j=_init.bind.length; i<j; i++) {
				_init.bind[i].apply(this, arguments);
			}
		},
		unbindEvent: function(obj) {
			for (var i=0, j=_init.unbind.length; i<j; i++) {
				_init.unbind[i].apply(this, arguments);
			}
		},
		unbindRelation : function(obj) {
			$(obj).unbind('click', _event.proxy)
			.unbind('dblclick', _event.proxy)
			.unbind('mouseover',_event.proxy)
			.unbind('mouseout', _event.proxy)
			.unbind('mousedown',_event.proxy)
			.unbind('mouseup', _event.proxy)
			.unbind('contextmenu', _event.proxy);
		},
		bindRelation : function(obj) {
			var me = $(obj),setting = _data.getSetting(obj),
				eventParam = {target: obj};
			if (!setting.view.txtSelectedEnable){
				me.bind('selectstart', function(e){
					var n = e.originalEvent.srcElement.nodeName.toLowerCase();
					return (n === "input" || n === "textarea" );
				}).css({
					"-moz-user-select":"-moz-none"
				});
			} 
			me.bind('click', eventParam,_event.proxy);
			me.bind('dblclick', eventParam,_event.proxy);
			me.bind('mouseover',eventParam,_event.proxy);
			me.bind('mouseout',eventParam, _event.proxy);
			me.bind('mousedown',eventParam,_event.proxy);
			me.bind('mouseup',eventParam, _event.proxy);
			me.bind('contextmenu',eventParam, _event.proxy);
		},
		_unbindEvent : function(obj) {
			var me = $(obj);
			for ( var e in _consts.event)
				me.unbind(_consts.event[e]);
		},
		_bindEvent : function(obj) {
			var me = $(obj),setting = _data.getSetting(obj);
			me.bind(_consts.event.NODECREATED, function(event, obj, node) {
				_tools.apply(setting.callback.onNodeCreated,
						[ obj, node ]);
			});
			me.bind(_consts.event.CLICK, function(event,srcEvent, obj, node) {
				_tools.apply(setting.callback.onClick, [ srcEvent, obj, node ]);
			});
			me.bind(_consts.event.RESIZE, function(event, obj) {
				_view.resizeLinePosition(obj);
			});
			me.bind(_consts.event.SHOWLINE, function(event, obj, node, isShow){
				_view.showNodeLine(obj, node, isShow);
			});
			me.bind(_consts.event.INIT, function(event, obj) {
				_tools.apply(_view.makeRelationNodes, [ event, obj ]);
			});

			me.bind(_consts.event.LINK, function(event, obj) {
				_tools.apply(_view.makeNodesLineToPage, [ event, obj ]);
			})
			
			me.bind(_consts.event.REMOVE, function(event, obj, node) {
				_tools.apply(setting.callback.onRemove, [obj , node]);
			})
		},
		proxy: function(e){
			var setting = _data.getSetting(e.data.target);
			var results = _event.doProxy(e),
			r = true, x = false;
			for (var i=0, l=results.length; i<l; i++) {
				var proxyResult = results[i];
				if (proxyResult.nodeEventCallback) {
					x = true;
					r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
				if (proxyResult.rEventCallback) {
					x = true;
					r = proxyResult.rEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
			}
			return r;
		},
		doProxy: function(e) {
			var results = [];
			for (var i=0, j=_init.proxys.length; i<j; i++) {
				var proxyResult = _init.proxys[i].apply(this, arguments);
				results.push(proxyResult);
				if (proxyResult.stop) {
					break;
				}
			}
			return results;
		},
		_eventProxy : function(event) {
			var target = event.target, obj = event.data.target,r_id = "", node = null, nodeEventType = "", nodeEventCallback = null,
					 rEventCallback = null, rEventType = "", tmp = null;
			if (_tools.eqs(event.type, 'mousedown')) {
				rEventType = "mousedown";
			} else if (_tools.eqs(event.type, 'mouseup')) {
				rEventType = "mouseup";
			} else if (_tools.eqs(event.type, 'mouseover')){
				rEventType = "mouseover";
			} else if (_tools.eqs(event.type, 'mouseout')){
				rEventType = "mouseout";
			}else if (_tools.eqs(event.type, 'contextmenu')) {
				rEventType = "contextmenu";
			} else if (_tools.eqs(event.type, 'click')) {
				tmp = _tools.getMDom(obj,target,[{tagName: "a" , attrName: _consts.id.A}]);
				if(tmp){
					r_id = _tools.getNodeMainDom(tmp).getAttribute('r_node');
					nodeEventType = "clickNode";
				}
			} else if(_tools.eqs(event.type, 'dblclick')){
				rEventType = "dblclick";
				tmp = _tools.getMDom(obj,target,[{tagName: "a" , attrName: _consts.id.A}]);
				if(tmp){
					r_id = _tools.getNodeMainDom(tmp).getAttribute('r_node');
					nodeEventType = "dblclick";
				}
			} 
			if (rEventType.length > 0 && r_id.length == 0) {
				tmp = _tools.getMDom(obj,target,[{tagName: "a" , attrName: _consts.id.A}]);
				if (tmp) {r_id = _tools.getNodeMainDom(tmp).getAttribute('r_node');}
			}
			if (r_id.length > 0) {
				node = _data.getNodeCache(obj, r_id);
				if(_tools.eqs(nodeEventType,"clickNode")){
					nodeEventCallback = handler.onClickNode;
				}
			}
			switch (rEventType) {
				case "mousedown" :
					rEventCallback = handler.onRMousedown;
					break;
				case "mouseup" :
					rEventCallback = handler.onRMouseup;
					break;
				case "dblclick" :
					rEventCallback = handler.onRDblclick;
					break;
				case "mouseout" :
					rEventCallback = handler.onRMouseOut;
					break;
				case "contextmenu" :
					rEventCallback = handler.onRContextmenu;
					break;
				case "mouseover" :
					rEventCallback = handler.onRmouseover;
					break;
			}
			var proxyResult = {
				stop: false,
				node: node,
				nodeEventType: nodeEventType,
				nodeEventCallback: nodeEventCallback,
				rEventType: rEventType,
				rEventCallback: rEventCallback
			};
			return proxyResult;

		}
	}, _tools = {
		eqs : function(str1, str2) {
			return str1.toLowerCase() == str2.toLowerCase();
		},
		apply : function(f, param, defaultValue) {
			if (this.eqs(typeof f, 'function')) {
				return f.apply($.fn.relationJs, param ? param : []);
			}
			return defaultValue;
		},
		getUid : function() {
			var S4 = function(){
		         return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			}
		    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		isExitsArray : function(str1, field, arr) {
			str1 = $.isArray(str1) ? str1 : [str1];
			for(var s in str1){
				for(var _a in arr){
					if ($.isArray(arr[_a][field])) {
						for ( var f in arr[_a][field]) {
							if (f == str1[s]) {
								return true;
							}
						}
					} else {
						if (arr[_a][field] == str1[s]) {
							return true;
						}
					}
				}
			}
			return false;
		},
		getChilds : function(value, key, nodes) {
			var chils = [];
			for ( var _n in nodes) {
				if ($.isArray(nodes[_n][key])) {
					for ( var __n in nodes[_n][key]) {
						if (nodes[_n][key][__n] == value)
							chils.push(nodes[_n]);
					}
				} else {
					if (nodes[_n][key] == value)
						chils.push(nodes[_n]);
				}
			}
			return chils;
		},
		getNodeByKey : function(id, idKey, nodes) {
			for ( var nKey in nodes) {
				if (nodes[nKey][idKey] == id)
					return nodes[nKey];
			}
		},
		drawLine : function(obj, position, color, attributes, line) {
			//TODO VML兼容未解决
			var __SVG = false,__svgNS = false,polyline = line,
				__svg = $("svg["+_consts.id.LINE+"]",obj),lineExist = false;
			if (document.createElementNS) {
			    __svgNS = "http://www.w3.org/2000/svg";
			    if (__svg.length < 1) {
					__svg = document.createElementNS(__svgNS, "svg");
					__svg.setAttributeNS(null, _consts.id.LINE, '');
					__svg.style.position = "absolute";
					__svg.style.width = "100%";
					__svg.style.height = "100%";
					obj.appendChild(__svg);
				} else {
					__svg = __svg[0];
				}
				if (polyline.length < 1) {
					polyline = obj.ownerDocument.createElementNS(__svgNS, "polyline")
				} else {
					polyline = polyline[0];
					lineExist = true;
				}
			    __SVG = (__svg.x != null);
			}else{
				 document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
		         var style = document.createStyleSheet();
				 style.addRule("v\\:polyline ","behavior: url(#default#VML);");
				 if (polyline.length < 1) {
						polyline = document.createElement("v:polyline");
				 } else {
						polyline = polyline[0];
						lineExist = true;
				 }
			}
			if (__SVG) {
					polyline.setAttributeNS(null, "points", position.join(' '));
					polyline.setAttributeNS(null, "fill", "none");
					polyline.setAttributeNS(null, "stroke", color || _consts.line.UNSELECTED_COLOR);
					polyline.setAttributeNS(null, _consts.id.LINE, '');
					if (attributes)
						for ( var k in attributes)
							polyline.setAttributeNS(null, k, attributes[k]);
					if(!lineExist)
						__svg.appendChild(polyline);
				} else if (document.createStyleSheet) {
					polyline.setAttribute("points", position.join(' '));
					polyline.setAttribute(_consts.id.LINE,'');
					polyline.strokecolor = color || _consts.line.UNSELECTED_COLOR;
					if (attributes)
						for ( var k in attributes)
							polyline.setAttribute(k,attributes[k]);
					if(!lineExist)
						obj.appendChild(polyline);
				} 
		},
		computedDomRange : function(sDom, pDom) {
			var position = [];
			var sCoords = sDom.offset(), pCoords = pDom.offset();
			pCoords['top'] += _consts.line.OFFSET_TOP;sCoords['top'] += _consts.line.OFFSET_TOP;
			sCoords['left'] += _consts.line.OFFSET_LEFT;pCoords['left'] += _consts.line.OFFSET_LEFT;
			var wdith = Math.abs(sCoords['left'] - pCoords['left']) / 2;
			var height = Math.abs(sCoords['top'] - pCoords['top']);
			position.push(sCoords['left'] + ',' + sCoords['top']);
			position.push((sCoords['left'] - wdith) + ',' + sCoords['top']);
			if (sCoords['top'] > pCoords['top']) {
				position.push((sCoords['left'] - wdith) + ','
						+ (sCoords['top'] - height));
				position.push((pCoords['left']) + ','
						+ (sCoords['top'] - height));
			} else if (sCoords['top'] < pCoords['top']) {
				position.push((sCoords['left'] - wdith) + ','
						+ (sCoords['top'] + height));
				position.push((pCoords['left']) + ','
						+ (sCoords['top'] + height));
			} else {
				position.push((pCoords['left'] + wdith) + ',' + pCoords['top']);
				position.push(pCoords['left'] + ',' + pCoords['top']);
			}
			return position;
		},
		arrayPushArray : function(target, src) {
			src.unshift(src.length, 0);
			Array.prototype.splice.apply(target, src);
		},
		getObjValues : function(obj) {
			var values = [];
			for ( var o in obj) {
				values.push(obj[o]);
			}
			return values;
		},
		clone : function(arr) {
			var r = [];
			for (var i = 0; i < arr.length; i++) {
				r.push(arr[i]);
			}
			return r;
		},
		ArrayIndexOf : function(val, arr) {
			for (var i = 0; i < arr.length; i++) {
				if (_tools.eqs(val, arr[i]))
					return i;
			}
			return -1;
		},
		getNodeMainDom: function(target){
			return ($(target).parent('li').get(0) || $(target).parentsUntil("li").parent().get(0));
		},
		getMDom: function(obj, curDom, targetExpr){
			if (!curDom) return null;
			while (curDom && curDom !== obj) {
				for (var i=0, l=targetExpr.length; curDom.tagName && i<l; i++) {
					if (_tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
						return curDom;
					}
				}
				curDom = curDom.parentNode;
			}
			return null;
		}
	}, 
	handler = {
		onRMousedown: function(event, node){
			var setting = _data.getSetting(event.data.target);
			if (_tools.apply(setting.callback.beforeMouseDown, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onMouseDown, [event, event.data.target, node]);
			}
			return true;
		},
		onRMouseOut: function(event, node){
			var setting = _data.getSetting(event.data.target);
			$(event.data.target).trigger(_consts.event.SHOWLINE, [event.data.target, node,false]);
			if (_tools.apply(setting.callback.beforeMouseOut, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onMouseOut, [event, event.data.target, node]);
			}
			return true;
		},
		onRMouseup: function(event, node){
			var setting = _data.getSetting(event.data.target);
			if (_tools.apply(setting.callback.beforeMouseUp, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onMouseUp, [event, event.data.target, node]);
			}
			return true;
		},
		onRDblclick: function(event, node){
			var setting = _data.getSetting(event.data.target);
			if (_tools.apply(setting.callback.beforeDblClick, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onDblClick, [event, event.data.target, node]);
			}
			return true;
		},
		onRContextmenu: function(event, node){
			var setting = _data.getSetting(event.data.target);
			if (_tools.apply(setting.callback.beforeRightClick, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onRightClick, [event, event.data.target, node]);
				return false;
			}
			return true;
		},
		onRmouseover: function(event, node){
			var setting = _data.getSetting(event.data.target);
			$(event.data.target).trigger(_consts.event.SHOWLINE, [event.data.target, node,true]);
			if(_tools.apply(setting.callback.beforeMouseOver, [event, event.data.target, node], true)) {
				_tools.apply(setting.callback.onMouseOver, [event, event.data.target, node]);
			}
			return true;
		},
		onClickNode: function(event, node){
			var setting = _data.getSetting(event.data.target),
			clickFlag = ( (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey)) && _data.isSelectedNode(event.data.target, node)) ? 0 : (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey) && setting.view.selectedMulti) ? 2 : 1;
			if (_tools.apply(setting.callback.beforeClick, [event,event.data.target, node], true) == false) return true;
			if (clickFlag === 0) {
				_view.cancelPreSelectedNode(event.data.target, node);
			} else {
				_view.selectNode(event.data.target, node, clickFlag === 2);
			}
			$(event.data.target).trigger(_consts.event.CLICK, [event, event.data.target, node]);
			return true;
		}
	},
	init = {
			_init : function(obj, setting, zNodes) {
				var me = $(obj),rsetting = $.extend(true, {}, _setting, setting),
					zNodes = zNodes ? $.isArray(zNodes) ? zNodes : [ zNodes ] : [];
				me.empty();
				_data.setSetting(obj, rsetting);
				var relationTools = init._initStep(obj, zNodes);
				var root = _data.getRoot(obj);
				root.relationTools = relationTools;
				_data.setRelationTools(obj, relationTools);
				return relationTools;
			},
			_initStep : function(obj, zNodes) {
				_data.initCache(obj);
				_data.initRoot(obj);
				_event.unbindRelation(obj);
				_event.unbindEvent(obj);
				_event.bindRelation(obj);
				_event.bindEvent(obj);
				var objTools = {
					target : obj,
					addNodes : function(nodes) {
						var nodes = $.isArray(nodes) ? nodes : [ nodes ];
						_view.createNodes(obj, nodes);
					},
					destroy : function() {
						_view.destroy(obj);
					},
					getNodes : function() {
						return _data.getNodes(obj);
					},
					getSelectedNodes : function() {
						return _tools.clone(_data.getRoot(obj).curSelectedList);
					},
					isSelectedNode : function(node) {
						return _data.isSelectedNode(obj, node);
					},
					refresh : function() {
						var nodes = _data.getCache(obj).nodes,
									setting = _data.getSetting(obj);
						$(obj).empty();
						init._init(obj, setting, nodes);
					},
					removeChildNodes : function(node) {
						if (!node)
							return;
						_view.removeNode(obj, node, false, true);
					},
					removeNode : function(node) {
						if (!node)
							return;
						_view.removeNode(obj, node, true, true);
					},
					selectNode : function(node) {
						if(!node)return;
						_view.selectNode( obj ,node);
					},
					getNodeById : function(id) {
						return _data.getNodeById(obj, id);
					},
					getNodesByParam: function(key, value,fuzzy, parents){
						var rids = {},nodes = [];
						if(typeof fuzzy == "object" || $.isArray(fuzzy)){
							parents = fuzzy;
							fuzzy = false;
						}
						parents = parents?($.isArray(parents) ? parents:[parents]) :
								_data.filterRootNodes(_data.getSetting(obj),_data.getCache(obj).nodes);
						for(var i=0;i<parents.length;i++){
							nodes = nodes.concat(_data.getNodesByParam(key,value,parents[i].getChilds(),fuzzy,rids));
						}
						return nodes;
					}
				};
				if (zNodes.length > 0) {
					_view.createNodes(obj, zNodes);
				}
				return objTools;
			},
			_initRoot : function(obj) {
				var r = _data.getRoot(obj);
				if (!r) {
					r = {};
					_data.setRoot(obj, r);
				}
				r.createdNodes = [];
				r.zId = 0;
				r._ver = (new Date()).getTime();
				return r;
			},
			_initCache : function(obj) {
				var c = _data.getCache(obj);
				if (!c) {
					c = {};
					_data.setCache(obj, c);
				}
				c.nodes = [];
				return c;
			},
			_initNode : function(obj, node){
				var rid = node['r_node'];
				node.getParents = function(){return _data.getParents(obj, rid);};
				node.getChilds = function(){return _data.getChilds(obj, rid);};
				node.getPreNode = function(){return _data.getPreNode(obj, rid);};
				node.getNextNode = function(){return _data.getNextNode(obj, rid);};
				node.getNodeLine = function(all){return _data.getNodeLine(obj, rid, all)};
			}
		},
		_init = {
			bind: [_event._bindEvent],
			unbind: [_event._unbindEvent],
			caches: [init._initCache],
			nodes: [init._initNode],
			proxys: [_event._eventProxy],
			roots: [init._initRoot],
			beforeA: [],
			afterA: [],
			innerBeforeA: [],
			innerAfterA: [],
			relationTools: []
		};
	
	$.fn.relationJs = function(options, param) {
		if (_tools.eqs(typeof options, 'string')) {
			return $.fn.relationJs.methods[options](this, param);
		}
		return init._init(this[0], options, param);
	};

	$.fn.relationJs.methods = {
		getOptions : function(obj) {
			var root = _data.getRoot(obj[0]);
			var setting = _data.getSetting(obj[0]);
			return {
				setting : setting,
				root : root,
				view : _view,
				tools : _tools,
				data : _data,
				event : _event
			}
		},
		destroy : function(obj) {
			view.destroy(obj[0]);
		}
	};
})(jQuery);
