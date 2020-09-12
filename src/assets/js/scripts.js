(function() {
	'use strict';

	//menu vertical slider
	Element.prototype.wilHasClass = function(className) {
		var hasClass = '';
		if (this !== null) {
			hasClass = this.className.search(new RegExp(className + '(\\s|$)', 'g')) !== -1;
		}
		return hasClass;
	};
	Element.prototype.wilAddClass = function(className) {
		if (this !== null) {
			if (!this.wilHasClass(className)) {
				this.className += ' ' + className;
			}
		}
	};
	Element.prototype.wilRemoveClass = function(className) {
		if (this !== null) {
			if (this.wilHasClass(className)) {
				this.className = this.className.replace(new RegExp(' ' + className + '(\\s|$)', 'g'), '');
			}
		}
	};
	Element.prototype.wilStyles = function(obj) {
		for (var prop in obj) {
			this.style[prop] = obj[prop];
		}
	};
	function wilEach(els, cb) {
		for (var i = 0, len = els.length; i < len; i++) {
			if (i === len) break;
			cb(els[i], i);
		}
	}
	function wilExtend(obj, src) {
		if (typeof src === 'object') {
			wilEach(Object.keys(src), (key) => {
				obj[key] = src[key];
			});
		}
		return obj;
	}

	// create wilMenuMobile
	class wilMenuVertical {
		constructor(el, opt) {
			this.optDefault = {
				menuWidth: 300,
				duration: 300,
				position: 'left',
				verticalAlign: 'middle',
				classBackButton: 'nav-back-button',
				backButton: '<a href="#">Quay lại</a>',
				nameLink: '<a href="#">{{nameLink}}</a>',
				classlink: 'sub-menu__name',
				classActive: 'active',
				easing: 'ease',
				arrow: '<span class="nav-arrow"></span>'
			};
			this.nav = el;
			this.opts = wilExtend(this.optDefault, opt);
			this.level = 0;
			this.create(document.querySelectorAll(this.nav));
		}

		create(els) {
			const { opts, nav } = this;

			wilEach(els, (el) => {
				this.wrapper(el);
				this.position(el);
				el.style.width = opts.menuWidth + 'px';
			});

			const menus = document.querySelectorAll(`${nav} .nav-menu`);
			const subMenus = document.querySelectorAll(`${nav} .sub-menu`);
			wilEach(menus, (menu) => {
				menu.setAttribute('data-height-default', menu.offsetHeight);
				menu.style.transition = `all ${opts.duration}ms ${opts.easing}`;
				menu.parentNode.style.height = `${menu.offsetHeight}px`;
			});
			wilEach(subMenus, (subMenu) => {
				this.createBackButton(menus, subMenu, (back, link, menus) => {
					this.handleClickBack(back, menus);
					this.handleClickLink(back, subMenu, menus, link);
				});
			});
			this.menuTranslate(menus, this.level);
		}

		wrapper(el) {
			const { opts } = this;
			const innerHtml = el.innerHTML;
			el.innerHTML = `
            <div class="nav-wrapper-inner">
                ${innerHtml}
            </div>
          `;
		}

		verticalAlign() {
			const { opts } = this;
			let y = 50;
			if (opts.verticalAlign === 'middle') y = 0;
			if (opts.verticalAlign === 'top') y = 0;
			if (opts.verticalAlign === 'bottom') y = 0;
			return y;
		}

		menuTranslate(menus, level, height) {
			const { opts } = this;
			wilEach(menus, (menu) => {
				menu.wilStyles({
					top: `${this.verticalAlign()}%`,
					transform: `translate(-${opts.menuWidth * level}px, -${this.verticalAlign()}%)`,
					width: `${opts.menuWidth}px`
				});
				menu.parentNode.wilStyles({
					width: `${opts.menuWidth * (level + 1)}px`,
					height: 'auto'
				});
				setTimeout(() => (menu.parentNode.style.height = height), opts.duration);
			});
		}

		position(el) {
			const { opts } = this;
			if (opts.position === 'left') {
				el.wilStyles({
					left: 0,
					right: 'auto'
				});
			} else if (opts.position === 'right') {
				el.wilStyles({
					right: 0,
					left: 'auto'
				});
			}
		}

		createBackButton(menus, subMenu, cb) {
			const { nav, opts } = this;
			const firstList = subMenu.children[0];
			const secondList = subMenu.children[0];
			const back = document.createElement('LI');
			const link = document.createElement('LI');
			back.wilAddClass(opts.classBackButton);
			link.wilAddClass(opts.classlink);
			back.innerHTML = opts.backButton;
			link.innerHTML = opts.nameLink;
			subMenu.insertBefore(back, firstList);
			subMenu.insertBefore(link, secondList);
			cb(back, link, menus);
		}

		handleClickLink(back, subMenu, menus, link) {
			const { nav, opts } = this;
			const menuHasSubMenu = subMenu.previousElementSibling;
			subMenu.wilStyles({
				visibility: 'hidden',
				top: `${this.verticalAlign()}%`,
				transform: `translate(100%, -${this.verticalAlign()}%)`
			});
			menuHasSubMenu.innerHTML = menuHasSubMenu.innerHTML + opts.arrow;
			menuHasSubMenu.addEventListener('click', (event) => {
				event.preventDefault();
				let subMenuHeight = event.currentTarget.nextElementSibling.offsetHeight;
				this.level++;
				this.menuTranslate(menus, this.level, `${subMenuHeight}px`);
				event.currentTarget.parentNode.wilAddClass(opts.classActive);
				subMenu.style.visibility = 'visible';
				let { nameLink } = opts;
				if (nameLink.indexOf('{{nameLink}}') !== -1) {
					nameLink = nameLink.replace(/{{nameLink}}/g, event.currentTarget.innerText);
				}
				link.innerHTML = nameLink;
			});
		}

		handleClickBack(back, menus) {
			const { opts } = this;
			const subMenu = back.parentNode;
			back.addEventListener('click', (event) => {
				event.preventDefault();
				this.level--;
				let ul = back.parentNode.parentNode.parentNode;
				let parentHeight = ul.offsetHeight;
				if (ul.getAttribute('data-height-default') !== null) {
					parentHeight = Number(ul.getAttribute('data-height-default'));
				}
				this.menuTranslate(menus, this.level, `${parentHeight}px`);
				back.parentNode.parentNode.wilRemoveClass(opts.classActive);
				setTimeout(() => (subMenu.style.visibility = 'hidden'), opts.duration);
			});
		}
	}

	const menu = new wilMenuVertical('.nav-mobile', {
		menuWidth: 320,
		duration: 250,
		// verticalAlign: 'middle',
		arrow: '<span class="nav-arrow"></span>',
		backButton: '<a href="#">Quay lại</a>',
		nameLink: '<a href="#">{{nameLink}}</a>',
		classlink: 'sub-menu__name',
		classBackButton: 'nav-back-button'
	});

	const navSlide = () => {
		const burger = document.querySelector('.burger');
		const nav = document.querySelector('.nav-mobile');
		burger.addEventListener('click', () => {
			nav.classList.toggle('nav-actives');
			burger.classList.toggle('toggle');
		});
		//submenu
		const itemSubmenuEls = [ ...document.querySelectorAll('.sub-menu__link') ];
		itemSubmenuEls.forEach((itemSubmenuEl) => {
			itemSubmenuEl.addEventListener('click', (event) => {
				event.preventDefault();
				const submenu = event.currentTarget.nextElementSibling;
				submenu && submenu.classList.toggle('sub-menu-actives');
			});
		});
		//tuyensinh
		const futureCarrerItemEls = [ ...document.querySelectorAll('.future-carrer__link') ];
		futureCarrerItemEls.forEach((futureCarrerItemEl) => {
			futureCarrerItemEl.addEventListener('click', (event) => {
				event.preventDefault();
				const futureCarrerDetails = event.currentTarget.nextElementSibling;
				const plusActive = event.currentTarget;
				futureCarrerDetails && futureCarrerDetails.classList.toggle('future-carrer__detail-active');
				plusActive && plusActive.classList.toggle('plus-active');
			});
		});
		const selectboxEl = document.querySelector('.selectbox');
		const priceEl = document.querySelector('.course-fee__price');
		selectboxEl.ad;
		selectboxEl.addEventListener('change', (event) => {
			event.preventDefault();
			const { value } = selectboxEl;
			priceEl.innerHTML = value;
		});
	};

	navSlide();
})();
