/**
 * @fileoverview IE6,7下面的离线存储
 * @author 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add(function(S) {
	var re = {},
		doc = document,
		initDate = new Date().getTime();

	var IE_OFFILINE = 'IE-OFFLINE',
		SINGLE_KEY = 'IE-SINGLE-KEY',
		TIME_DEADLINE = 'TIME-DEADLINE';

	var oIeOffiline = doc.createElement('link');
	if(oIeOffiline.addBehavior) {
		oIeOffiline.style.behavior = 'url(#default#userData)';
		doc.getElementsByTagName('head')[0].appendChild(oIeOffiline);
	}
	var oGlobal, oDeadline;
	S.mix(re, {
		/**
		 * 初始化，将浏览器里存储的数据读取出来，并进行处理
		 * @return {Object} this
		 */
		init: function() {
			oIeOffiline.load(IE_OFFILINE);
			oGlobal = S.JSON.parse(oIeOffiline.getAttribute(SINGLE_KEY)) || {};
			oDeadline = S.JSON.parse(oIeOffiline.getAttribute(TIME_DEADLINE)) || {};
			//var dateNow = new Date().getTime();
			this._initDeadline();
			return this;
		},
		/**
		 * 初始化对各个离线字段进行过期处理
		 */
		_initDeadline:function(){
			var dateKey, dateBet;
			for(var i in oDeadline) {
				if(oDeadline.hasOwnProperty(i)) {
					dateKey = parseInt(oDeadline[i], 10);
					dateBet = dateKey - initDate;
					if(bet <= 0) {
						this.removeItem(i);
					} else {
						this._deadlineKey(i, dateBet);
					}
				}
			}
		},
		setItem: function(key, value, deadline) {
			oGlobal[key] = value;
			if(deadline) {
				var numDeadline = parseInt(deadline, 10),
					nowDate = new Date().getTime();
				//设置时间=用户提供的时间 + 当前时间
				oDeadline[key] = numDeadline + nowDate;
				this._deadlineKey(key, numDeadline);
			}
			return this._saveToBrowser();
			//return true;
		},
		getItem: function(key) {
			//var global = this._getData();
			return oGlobal[key];
		},
		removeItem: function(key) {
			delete oGlobal[key];
			delete oDeadline[key];
			return this._saveToBrowser();
		},
		clear: function() {
			oGlobal = {};
			oDeadline = {};
			return this._saveToBrowser();
			//doc.removeChild(oIeOffiline);
		},
		size: function() {
			var numLen = 0;
			for(var i in oGlobal) {
				if(oGlobal.hasOwnProperty(i)) {
					numLen++;
				}
			}
			return numLen;
		},
		timeRemain: function(key) {
			//本身已经不存在这个key了
			if(!key in oGlobal) {
				return 0;
			}
			if(key in oDeadline) {
				return oDeadline[key] - new Date().getTime();
			} else {
				return -1;
			}
		},
		usedByte: function() {
			var tempLen = 0,
				strDeadLine =S.JSON.stringify(oDeadline);
			//deadline不存在
			if(oDeadline !== ''){
				tempLen += strDeadLine.length + TIME_DEADLINE.length;
			}			
			tempLen += S.JSON.stringify(oGlobal).length;
			return tempLen;
		},
		getAll: function(isObject) {
			if(isObject){
				return oGlobal;
			}
			return S.JSON.stringify(oGlobal);
		},
		/**
		 * 设置字段的过期时间
		 * @private
		 * @param  {String} key      字段名
		 * @param  {Numer} deadline 过期时间
		 */
		_deadlineKey: function(key, deadline) {
			var self = this;
			S.later(function() {
				self.removeItem(key);
			}, deadline);
		},
		/**
		 * 保存到浏览器里
		 * @private
		 * @return {Boolean} 操作成功返回true，失败返回false
		 */
		_saveToBrowser: function() {
			var flag = true;
			try {
				oIeOffiline.setAttribute(TIME_DEADLINE, S.JSON.stringify(oDeadline));
				oIeOffiline.setAttribute(SINGLE_KEY, S.JSON.stringify(oGlobal));
				oIeOffiline.save(IE_OFFILINE);
			} catch(e) {
				// 磁盘已满或权限不足等问题
				flag = false;
			}
			return flag;
		}
	});
	re.init();
	return re;
});