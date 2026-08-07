// Small progressive-enhancement helpers (everything else is plain form posts/links).
document.addEventListener('DOMContentLoaded', function () {
  // Leave form: show/hide the certificate file input based on leave type.
  var lvType = document.getElementById('lv-type');
  var lvDocWrap = document.getElementById('lv-doc-wrap');
  if (lvType && lvDocWrap) {
    var toggle = function () { lvDocWrap.style.display = lvType.value === 'sick' ? 'block' : 'none'; };
    lvType.addEventListener('change', toggle);
    toggle();
  }

  // Confirm before any destructive delete/remove action.
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('submit', function (e) {
      if (!window.confirm(el.getAttribute('data-confirm'))) e.preventDefault();
    });
  });
});
