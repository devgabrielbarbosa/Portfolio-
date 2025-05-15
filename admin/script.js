import {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from "../firebase/firebase-config.js";

// Upload imagem para ImgBB
const uploadImageToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://api.imgbb.com/1/upload?key=5633d7932b72210c398e734ddbc2d8ea", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (data.success) {
    return data.data.url;
  } else {
    throw new Error("Erro no upload da imagem");
  }
};

const form = document.querySelector("#form-projeto");
const adminContainer = document.querySelector("#admin-projetos");
const imagemInputProjeto = document.querySelector("#imagem-projeto");
const imagemPreviewProjeto = document.querySelector("#imagem-preview-projeto");

let idEditando = null;

// Preview da imagem selecionada no input
imagemInputProjeto?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && imagemPreviewProjeto) {
    imagemPreviewProjeto.src = URL.createObjectURL(file);
    imagemPreviewProjeto.style.display = "block";
  }
});

// Limpar campos e preview
function limparCampos() {
  form.reset();
  if (imagemPreviewProjeto) {
    imagemPreviewProjeto.style.display = "none";
    imagemPreviewProjeto.src = "";
  }
  idEditando = null;
  form.removeAttribute("data-id");
  form.querySelector("button[type='submit']").textContent = "Adicionar";
}

// Exibir projetos no painel admin
async function exibirProjetosAdmin() {
  if (!adminContainer) return;
  adminContainer.innerHTML = "";

  try {
    const projetosSnapshot = await getDocs(collection(db, "projetos"));

    projetosSnapshot.docs.forEach(docRef => {
      const projeto = docRef.data();
      const id = docRef.id;
      const imagemURL = projeto.imagem && projeto.imagem.trim() !== "" ? projeto.imagem : "https://via.placeholder.com/150";

      const link = typeof projeto.link === "string" && projeto.link.trim() !== "" ? projeto.link : null;

      const projetoDiv = document.createElement("div");
      projetoDiv.classList.add("projeto-admin");
      projetoDiv.innerHTML = `
        <div class="projeto">
          <img src="${imagemURL}" alt="Imagem do Projeto" style="max-width: 150px; max-height: 150px;" />
          <h3>${projeto.titulo}</h3>
          <p>${projeto.descricao}</p>
          ${link ? `<a href="${link}" target="_blank">Ver Projeto</a>` : ""}
          <br>
          <button class="editar-btn" data-id="${id}">Editar</button>
          <button class="deletar-btn" data-id="${id}">Deletar</button>
        </div>
      `;
      adminContainer.appendChild(projetoDiv);
    });
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
  }
}

// Ouvir cliques nos botões editar e deletar
adminContainer?.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("deletar-btn")) {
    if (confirm("Deseja realmente deletar este projeto?")) {
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

  if (e.target.classList.contains("editar-btn")) {
    try {
      const projetoDoc = doc(db, "projetos", id);
      const projetoSnapshot = await getDoc(projetoDoc);
      const projetoData = projetoSnapshot.data();

      if (projetoData) {
        form.querySelector("#titulo").value = projetoData.titulo || "";
        form.querySelector("#descricao").value = projetoData.descricao || "";
        form.querySelector("#link").value = projetoData.link || "";

        if (projetoData.imagem) {
          imagemPreviewProjeto.src = projetoData.imagem;
          imagemPreviewProjeto.style.display = "block";
        } else {
          imagemPreviewProjeto.style.display = "none";
          imagemPreviewProjeto.src = "";
        }

        idEditando = id;
        form.setAttribute("data-id", id);
        form.querySelector("button[type='submit']").textContent = "Salvar Alterações";
      } else {
        alert("Projeto não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar projeto:", error);
      alert("Erro ao carregar projeto para edição.");
    }
  }
});

// Envio do formulário para adicionar ou editar projeto
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.querySelector("#titulo").value.trim();
  const descricao = document.querySelector("#descricao").value.trim();
  const link = document.querySelector("#link").value.trim() || "#";
  const projetoId = form.getAttribute("data-id");
  const imagemInputProjeto = document.getElementById("imagem-projeto");
  let imagemUrlProjeto = null;

  // Se houver nova imagem selecionada, faça upload e obtenha URL
  if (imagemInputProjeto?.files[0]) {
    try {
      imagemUrlProjeto = await uploadImageToImgBB(imagemInputProjeto.files[0]);
    } catch (error) {
      alert("Erro ao enviar imagem do projeto: " + error.message);
      return;
    }
  }

  if (titulo && descricao) {
    try {
      if (projetoId) {
        // Atualizar projeto existente
        const projetoRef = doc(db, "projetos", projetoId);
        const projetoSnapshot = await getDoc(projetoRef);
        const projetoAtual = projetoSnapshot.data();

        // Se não enviar nova imagem, mantém a antiga
        const imagemParaSalvar = imagemUrlProjeto || projetoAtual.imagem || "";

        await updateDoc(projetoRef, {
          titulo,
          descricao,
          link,
          imagem: imagemParaSalvar
        });

        alert("Projeto atualizado com sucesso!");
      } else {
        // Criar novo projeto
        await addDoc(collection(db, "projetos"), {
          titulo,
          descricao,
          link,
          imagem: imagemUrlProjeto || "",
          criadoEm: new Date()
        });
        alert("Projeto adicionado com sucesso!");
      }

      form.reset();
      form.removeAttribute("data-id");
      document.querySelector("button[type='submit']").textContent = "Adicionar";
      const preview = document.getElementById("imagem-preview-projeto");
      if (preview) {
        preview.style.display = "none";
        preview.src = "";
      }
      exibirProjetosAdmin();
    } catch (error) {
      console.error("Erro ao adicionar ou editar projeto:", error);
      alert("Erro ao adicionar ou editar projeto.");
    }
  } else {
    alert("Preencha todos os campos.");
  }
});


// Inicializar lista na carga da página
document.addEventListener("DOMContentLoaded", () => {
  exibirProjetosAdmin();
});

