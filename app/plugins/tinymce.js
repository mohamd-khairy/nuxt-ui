// plugins/tinymce.js
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist autolink link image lists charmap print preview anchor code fullscreen help emoticons';

export default (context, inject) => {
  // Inject tinymce into the Nuxt context to make it accessible in all components
  inject('tinymce', window.tinymce);
};
