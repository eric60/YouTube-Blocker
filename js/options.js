function save_options() {
    alert('You have saved your options')
}

window.onload=function(){
    let save = document.getElementById('save');
    save.addEventListener('click', save_options);
}

