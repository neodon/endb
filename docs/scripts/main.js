(function() {
	const navbarHeight = document.querySelector('.main-navbar').offsetHeight;

	function scrollWithOffset() {
		const targetElement = document.querySelector(':target');
		window.scroll({top: targetElement.offsetTop - navbarHeight});
	}

	window.addEventListener('hashchange', scrollWithOffset, false);
	window.addEventListener('DOMContentLoaded', scrollWithOffset, false);

	document.querySelector('#show-menu').checked = false;
})();
