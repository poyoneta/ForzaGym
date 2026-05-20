console.log("Script funcionando correctamente");

alert("¡Bienvenido al Gimnasio Forza!");

const botonFormulario = document.querySelector(".formulario button");

botonFormulario.addEventListener("click", (e) => {
  e.preventDefault(); 

  document.body.style.backgroundColor = "#00ff66";

  alert("✅ Mensaje enviado con éxito");
});
