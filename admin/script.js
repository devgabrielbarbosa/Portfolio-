import {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "../firebase/firebase-config.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
const form = document.querySelector("#form-projeto");
const adminContainer = document.querySelector("#admin-projetos");

// Adicionar projeto
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-projeto");
  const mensagem = document.querySelector("#mensagem");
  let editarProjetoId = null; // Variável para armazenar o ID do projeto que está sendo editado

  // Função para exibir projetos no painel de administração
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("editar-btn")) {
      editarProjetoId = e.target.getAttribute("data-id"); // Obtém o ID do projeto
      const projetoDoc = doc(db, "projetos", editarProjetoId);
      const projetoSnapshot = await getDoc(projetoDoc);
      const projetoData = projetoSnapshot.data();

      // Preenche os campos de edição com os dados do projeto
      document.querySelector("#titulo").value = projetoData.titulo;
      document.querySelector("#descricao").value = projetoData.descricao;
      document.querySelector("#link").value = projetoData.link || ''; // Se não tiver link, deixa vazio

      // Muda o texto do botão para "Salvar alterações"
      document.querySelector("button[type='submit']").textContent = "Salvar Alterações";
    }

    exibirProjetosAdmin(); // Atualiza a lista de projetos
    if (e.target.classList.contains("deletar-btn")) {
      const confirmar = confirm("Deseja realmente deletar este projeto?");
      if (confirmar) {
        const projetoId = e.target.getAttribute("data-id");
        await deleteDoc(doc(db, "projetos", projetoId));
        exibirProjetosAdmin(); // Atualiza a lista de projetos
      }
    }
  });

  exibirProjetosAdmin(); // Chama a função para exibir os projetos ao carregar a página
});

// Exibir projetos
async function exibirProjetosAdmin() {
  if (!adminContainer) return;

  adminContainer.innerHTML = ""; // limpa antes de exibir

  try {
    const projetosSnapshot = await getDocs(collection(db, "projetos"));
    projetosSnapshot.docs.forEach(docRef => {
      const projeto = docRef.data();
      const id = docRef.id;

      const projetoDiv = document.createElement("div");
      projetoDiv.classList.add("projeto-admin");

      projetoDiv.innerHTML = `
        <h3>${projeto.titulo}</h3>
        <p>${projeto.descricao}</p>
        <a href="${projeto.link}" target="_blank">Ver Projeto</a>
        <br>
        <button class="editar-btn" data-id="${id}">Editar</button>
        <button class="deletar-btn" data-id="${id}">Deletar</button>
      `;

      adminContainer.appendChild(projetoDiv);
    });
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
  }
}

// Delegação de eventos para editar e deletar
if (adminContainer) {
  adminContainer.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    // Deletar
    if (e.target.classList.contains("deletar-btn")) {
      const confirmar = confirm("Deseja realmente deletar este projeto?");
      if (confirmar) {
        try {
          await deleteDoc(doc(db, "projetos", id));
          alert("Projeto deletado com sucesso!");
          exibirProjetosAdmin();
        } catch (error) {
          console.error("Erro ao deletar projeto:", error);
          alert("Erro ao deletar projeto.");
        }
      }
    }

    // Editar
    if (e.target.classList.contains("editar-btn")) {
      try {
        // Buscar os dados do projeto selecionado
        const projetoDoc = doc(db, "projetos", id);
        const projetoSnapshot = await getDoc(projetoDoc);
        const projetoData = projetoSnapshot.data();

        // Preencher os campos de edição com os dados do projeto
        document.querySelector("#titulo").value = projetoData.titulo;
        document.querySelector("#descricao").value = projetoData.descricao;
        document.querySelector("#link").value = projetoData.link || '';

        // Alterar o texto do botão de envio para "Salvar Alterações"
        document.querySelector("button[type='submit']").textContent = "Salvar Alterações";

        // Adicionar o ID do projeto ao formulário para saber qual projeto está sendo editado
        document.querySelector("#form-projeto").setAttribute("data-id", id);
      } catch (error) {
        console.error("Erro ao buscar projeto:", error);
        alert("Erro ao carregar projeto para edição.");
      }
    }
  });
}

// Função para adicionar ou editar projeto
document.querySelector("#form-projeto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.querySelector("#titulo").value;
  const descricao = document.querySelector("#descricao").value;
  const link = document.querySelector("#link").value;
  const projetoId = document.querySelector("#form-projeto").getAttribute("data-id");

  if (titulo && descricao) {
    try {
      if (projetoId) {
        // Editar um projeto
        const projetoDoc = doc(db, "projetos", projetoId);
        await updateDoc(projetoDoc, {
          titulo,
          descricao,
          link
        });
        alert("Projeto atualizado com sucesso!");
      } else {
        // Adicionar um novo projeto
        await addDoc(collection(db, "projetos"), {
          titulo,
          descricao,
          link,
          criadoEm: new Date()
        });
        alert("Projeto adicionado com sucesso!");
      }

      // Limpar os campos e resetar o formulário
      document.querySelector("#form-projeto").reset();
      document.querySelector("button[type='submit']").textContent = "Adicionar"; // Resetando o botão
      exibirProjetos(); // Recarregar a lista de projetos
    } catch (error) {
      console.error("Erro ao adicionar ou editar projeto:", error);
      alert("Erro ao adicionar ou editar projeto.");
    }
  } else {
    alert("Preencha todos os campos.");
  }
});


