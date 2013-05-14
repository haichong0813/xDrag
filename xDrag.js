/**
* @xDrag 拖拽元素
* @author zhaohailong
* @version 1.0
* @update 2013-5-11
*/

;(function($){
	$.fn.drag = function(options){
			//默认值
			var defaults = {
				opacity:0.5, //拖拽元素透明度
				placeholder:'placeholder', //占位符类名
				dashed:'dashed', //虚线类名
				border:'b-none', //去除元素列表最后一个边框
				sort:0 //排序方式，0:纵向拖拽，1:横向拖拽
			};

			options = $.extend({},defaults,options);//合并参数

			/* 私有成员 */
			var $dragging = null,//当前拖拽对象
			$placeholder = null,//占位符对象
			diffXY = null,//元素位置和鼠标位置之间的差值
			dragXY = null,//元素跟随鼠标的位置
			pageXY = null,//鼠标位置
			offsetXY = null,//元素相对视窗的相对坐标
			scrollXY = null,//滚动条的距离
			rangeLRTB = null,//容器范围
			startXY = null,//拖拽元素起始坐标
			timer = null,
			index = 0,//拖拽元素鼠标放下后集合中的索引位置
			height = 0,//元素高度
			width = 0,//元素宽度
			selector = this.selector,//选择器
			$container = $(this).parent(),//容器对象;
			$drag = $(this);//拖拽元素集合

			//遍历元素
			return this.each(function(){
				//元素选中后
				$(this).mousedown(function(event){
					diffXY = getDiffXY(this,event);//记录元素位置和鼠标位置之间的差值
					rangeLRTB = getContainerRange();//记录容器范围
					dragXY = getDragXY(event);//获取元素位置

					$(this).css({
						'position':'absolute',
						'opacity':options.opacity,
						'left':dragXY.x,
						'top':dragXY.y
					});//设置元素样式

					appendPlaceholder(this);//添加占位元素
					$container.addClass(options.dashed);//添加虚线效果

					startXY = getPageXY(event);//记录元素起始坐标
					height = $(this).outerHeight();//记录元素高度
					width = $(this).outerWidth();//记录元素宽度
					$dragging = $(this);//记录当前拖拽对象
				});

				//元素拖拽中
				document.onmousemove = dragMove;

				//元素放下后
				document.onmouseup = function(event){
					if($dragging !== null){

						//自动吸附临界值
						var w2 = width/2,
						h2 = height/2;
						
						//判断拖拽元素是否移动到容器范围外
						if(rangeLRTB.left - w2 > dragXY.x + width || dragXY.x > rangeLRTB.right + w2 || rangeLRTB.top - h2 > dragXY.y + height || dragXY.y > rangeLRTB.bottom + h2){
							$dragging.removeAttr('style').hide().fadeIn(200);
							$placeholder.remove();
						}else{
							$placeholder.replaceWith($dragging.removeAttr('style').hide().fadeIn(200));
						}

						//重置
						$drag = $(selector);//重置元素集合序列
						$drag.removeClass(options.border).last().addClass(options.border);//去除最后一个元素的边框
						$container.removeClass(options.dashed);//去除虚线框
						$dragging = $placeholder = pageXY = dragXY = diffXY = scrollXY = offsetXY = startXY = rangeLRTB = null;
						index = 0;//重置索引
					}

					//注销事件，释放内存
					document.onmousemove = null;
					if(timer) clearTimeout(timer);
					timer = setTimeout(function(){
						document.onmousemove = dragMove;
					},100);
				};
			});

			
			/* 私有方法 */

			//获取事件对象
			function getEvent(event){
				return event ? event : window.event;
			}

			//获取滚动条的距离
			function getScrollXY(){
				return {'x':(document.body.scrollLeft || document.documentElement.scrollLeft),'y':(document.body.scrollTop || document.documentElement.scrollTop)};
			}

			//获取鼠标位置
			function getPageXY(event){
				var event = getEvent(event),
				pageX = event.pageX,
				pageY = event.pageY,
				scrollXY = getScrollXY();

				if(pageX === undefined){
					pageX = event.clientX + scrollXY.x;
					pageY = event.clientY + scrollXY.y;
				}
				return {'x':pageX,'y':pageY};
			}

			//获取元素和鼠标位置之间的差值（解决鼠标总是在元素左上角的问题）
			function getDiffXY(obj,event){
				pageXY = getPageXY(event);
				offsetXY = getAbsPos(obj);
				return {'x':pageXY.x - offsetXY.x,'y':pageXY.y - offsetXY.y };
			}

			//获取元素跟随鼠标的位置
			function getDragXY(event){
				return {'x':pageXY.x - diffXY.x,'y':pageXY.y - diffXY.y};
			}

			//获取元素相对视窗的绝对位置
			function getAbsPos(obj){
				var offsetX = obj.offsetLeft,
				offsetY = obj.offsetTop,
				current = obj.offsetParent;
				while(current !== null){
					offsetX+= current.offsetLeft;
					offsetY+= current.offsetTop;
					current = current.offsetParent;
				}
				return {'x':offsetX,'y':offsetY};
			}

			//获取容器范围
			function getContainerRange(){
				var offset = getAbsPos($container[0]);//容器范围
				offsetLeft = offset.x,//左边界
				offsetRight = offset.x + $container.outerWidth(),//右边界
				offsetTop = offset.y,//上边界
				offsetBottom = offset.y + $container.outerHeight();//下边界
				// console.log('左边界:'+offsetLeft+' 右边界：'+offsetRight+' 上边界：'+offsetTop+' 下边界：'+offsetBottom);
				return {'left':offsetLeft,'right':offsetRight,'top':offsetTop,'bottom':offsetBottom};
			}

			//创建占位符
			function createPlaceholder(obj){
				$placeholder = $('<'+ obj.tagName +' class="'+ options.placeholder +' '+ options.border +'">');//初始化占位元素
				return $placeholder;
			}

			//添加占位符
			function appendPlaceholder(obj){
				($placeholder) ? $(obj).after($placeholder) : $(obj).after(createPlaceholder(obj));
			}

			//鼠标拖拽中
			function dragMove(event){
				if($dragging !== null){
					pageXY = getPageXY(event);
					dragXY = getDragXY(event);

					//设置元素位置
					$dragging.css({
						'left':dragXY.x,
						'top':dragXY.y
					});

					//排序方式，纵向拖拽或横向拖拽
					if(options.sort === 0){
						//计算当前鼠标位置的元素索引
						index = Math.floor((pageXY.y - rangeLRTB.top) / height);
						
						//判断当前鼠标位置是否大于元素起始位置，从而确定是向后还是向前追加元素
						if(pageXY.y > startXY.y){
							//判断是否超出元素索引范围
							if(index < $drag.length){
								$drag.eq(index).after($placeholder);
							}
						}else{									
							if(index > -1){
								$drag.eq(index).before($placeholder);
							}
						}
					}else{
						//计算当前鼠标位置的元素索引
						index = Math.floor((pageXY.x - rangeLRTB.left) / width);

						//判断当前鼠标位置是否大于元素起始位置，从而确定是向后还是向前追加元素
						if(pageXY.x > startXY.x){
							//判断是否超出元素索引范围
							if(index < $drag.length){
								$drag.eq(index).after($placeholder);
							}
						}else{									
							if(index > -1){
								$drag.eq(index).before($placeholder);
							}
						}
					}
				}
			}
		};
})(jQuery);