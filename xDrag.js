/**
* @xDrag 拖拽元素
* @author zhaohailong
* @version 1.0
* @update 2013-5-11
*/

;(function($){
	$.fn.extend({
		drag:function(options){
			//默认值
			var defaults = {
				opacity:0.5,//拖拽元素透明度
				placeholder:'placeholder',//占位符类名
				dashed:'dashed'//虚线类名
			};

			options = $.extend(defaults,options);//合并参数

			var $dragging = null,//当前拖拽对象
			$placeholder = null,//占位符对象
			diffXY = null,//元素位置和鼠标位置之间的差值
			pageXY = null,//鼠标位置
			offsetXY = null,//元素相对视窗的相对坐标
			rangeLRTB = null,//容器范围
			startY = 0,//拖拽元素起始纵坐标
			index = 0,//拖拽元素鼠标放下后集合中的索引位置
			height = 0,//元素高度
			width = 0,//元素宽度
			selector = this.selector,//选择器
			$container = options.container;//容器对象;

			var drag = this,
			$drag = $(this);
			drag.methods = {
				getEvent:function(event){
					return event ? event : window.event;
				},
				getPageXY:function(event){
					var event = this.getEvent(event),
					pageX = event.pageX,
					pageY = event.pageY;

					if(pageX === undefined){
						pageX = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
						pageY = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
					}
					return {'x':pageX,'y':pageY};
				},
				getDiffXY:function(event){
					pageXY = drag.methods.getPageXY(event);
					offsetXY = drag.methods.getAbsPos(this);
					return {'x':pageXY.x - offsetXY.x,'y':pageXY.y - offsetXY.y};
				},
				getDragXY:function(event){
					pageXY = this.getPageXY(event);
					return {'x':pageXY.x - diffXY.x,'y':pageXY.y - diffXY.y};
				},
				getAbsPos:function(obj){
					var offsetX = obj.offsetLeft,
					offsetY = obj.offsetTop;
					if(obj.offsetParent){
						offsetX+= obj.offsetParent.offsetLeft;
						offsetY+= obj.offsetParent.offsetTop;
					}
					return {'x':offsetX,'y':offsetY};
				},
				getContainerRange:function(){
					var offset = this.getAbsPos($container[0]);//容器范围
					offsetLeft = offset.x,//左边界
					offsetRight = offset.x + $container.outerWidth(),//右边界
					offsetTop = offset.y,//上边界
					offsetBottom = offset.y + $container.outerHeight();//下边界
					// console.log('左边界:'+offsetLeft+' 右边界：'+offsetRight+' 上边界：'+offsetTop+' 下边界：'+offsetBottom);
					return {'left':offsetLeft,'right':offsetRight,'top':offsetTop,'bottom':offsetBottom};
				},
				createPlaceholder:function(){
					$placeholder = $('<'+ drag.eq(0)[0].tagName +' class="'+ options.placeholder +'">');//初始化占位元素
					return $placeholder;
				},
				appendPlaceholder:function(){
					($placeholder) ? $(this).after($placeholder) : $(this).after(drag.methods.createPlaceholder());
				},
				dragMove:function(event){
					if($dragging !== null){
						pageXY = drag.methods.getPageXY(event);
						DragXY = drag.methods.getDragXY(event);

						//设置元素位置
						$dragging.css({
							'left':DragXY.x,
							'top':DragXY.y
						});

						$container.addClass(options.dashed);//添加虚线效果
						
						//计算当前鼠标位置的元素索引
						index = Math.floor((pageXY.y - rangeLRTB.top) / height);

						//判断当前鼠标位置是否大于元素起始位置，从而确定是向后还是向前追加元素
						if(pageXY.y > startY){
							//判断是否超出元素索引范围
							if(index < $(drag).length){
								$drag.eq(index).after($placeholder);
							}
						}else{									
							if(index > -1){
								$drag.eq(index).before($placeholder);
							}
						}
					}
				}
			};

			//遍历元素
			return this.each(function(){
				//元素选中后
				$(this).mousedown(function(event){
					$(this).css({'position':'absolute','opacity':options.opacity});//设置元素样式

					height = $(this).outerHeight();//元素高度
					width = $(this).outerWidth();//元素宽度

					diffXY = drag.methods.getDiffXY.call(this,event);//计算元素位置和鼠标位置之间的差值

					rangeLRTB = drag.methods.getContainerRange();//计算容器范围

					drag.methods.appendPlaceholder.call(this);//添加占位元素

					startY = drag.methods.getPageXY(event).y;//记录元素起始纵坐标
					$dragging = $(this);//记录当前拖拽对象
				});

				//元素拖拽中
				document.onmousemove = drag.methods.dragMove;

				//元素放下后
				document.onmouseup = function(event){
					if($dragging !== null){
						//判断拖拽元素是否移动到容器范围外
						if(rangeLRTB.left > DragXY.x + width || DragXY.x > rangeLRTB.right || rangeLRTB.top > DragXY.y + height || DragXY.y > rangeLRTB.bottom){
							$dragging.removeAttr('style').hide().fadeIn(600);
							$placeholder.remove();
						}else{
							$placeholder.replaceWith($dragging.removeAttr('style').hide().fadeIn(600));
						}

						//重置变量
						$drag = $(selector);
						$container.removeClass(options.dashed);
						$dragging = pageXY = DragXY = offsetXY = null;
						index = 0;
					}

					//注销事件，释放内存
					document.onmousemove = null;
					setTimeout(function(){
						document.onmousemove = drag.methods.dragMove;
					},100);
				};
			});
		}
	});
})(jQuery);