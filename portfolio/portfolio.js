import { db, collection } from "../firebase/firebase-config.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const portfolioContainer = document.querySelector("#projetos-portfolio");

  try {
    const snapshot = await getDocs(collection(db, "projetos"));
    const projetos = snapshot.docs.map(doc => doc.data());

    projetos.forEach(projeto => {
      const card = document.createElement("div");
      card.classList.add("projeto-card");

      card.innerHTML = `
      <div class="projeto">
        <img  src="${projeto.imagem}" alt="${projeto.titulo}" />
        <h3>${projeto.titulo}</h3>
        <p>${projeto.descricao}</p>

        <button ><a href="${projeto.link}" target="_blank">Ver Projeto</a></button>
      </div>
      `;

      portfolioContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
  }
});


