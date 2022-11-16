
let editBtns = document.querySelectorAll('.editButon');
let modal = document.querySelector('.modal');



// editBtn.addEventListener('click',function(){
//     modal.style.display = 'block';
// })
editBtns.forEach((button) =>{
    button.addEventListener("click", function(){
        let id = button.value;
        console.log(id);
        modal.style.display = 'block';
        document.getElementById("saveEdit").value = id;
        fetch(`/getItemById?id=${id}`,{
            method: 'get'
        })
        .then(res => res.json())
        .then(data =>{
            console.log(data.name);
            document.getElementById("editName").placeholder = data.name;
            document.getElementById("editDate").placeholder = data.date.toLocaleDateString("en-US",{weekday: "long", day: "numeric", month:"long"});
            
        })
        document.getElementById("cancelEdit").addEventListener("click",function(){
            modal.style.display = 'none';
        });
    });
});