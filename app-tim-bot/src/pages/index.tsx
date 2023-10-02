import { ChangeEvent, useEffect, useState } from "react";
import { api, apiWhatsapp } from "../service/api";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkPlanilha, setLinkPlanilha] = useState("https://docs.google.com/spreadsheets/d/1pt9MuTgjMNydAaDiVFf3fZjJmKVnE_mp3D1zJUc8v9o/edit#gid=0");
  const [qrcodeImg, setqrcodeImg] = useState("");
  const [statusSession, setStatusSession] = useState("")
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const onChange = (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      setFile(files[0]);
    }
  };
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("")
      setIsLoading(true);
      const response = await api.post("upload", formData);
      const data = response.data;
      return data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status === 429) {
          setError("Aguarde, há outra planilha sendo processada")
        }
      }
      else if (error.status === 500) {
        setError(`Erro de comunicação interna, tente novamente (${error.message})`)
      } else if (error.code === "ERR_NETWORK") {
        setError("Não foi possível estabelecer uma conexão com o servidor.")
      }
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    // Define uma função para fazer a chamada HTTP e atualizar o statusSession
    const getCurrentSessionStatus = async () => {
      try {

        const generateTokenResponse = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/${process.env.NEXT_PUBLIC_API_WPP_SECRET}/generate-token`)
        const { token } = generateTokenResponse.data;

        // INICIAR SESSÃO C/ TOKEN //
        const headersConfig = { headers: { Authorization: `Bearer ${token}` } };

        const statusSessionResponse = await apiWhatsapp.get(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/status-session`, headersConfig)
        const { status } = statusSessionResponse.data;

        setStatusSession(status);

      } catch (error) {
        setStatusSession("Não foi possível obter o status");
      }
    };

    // Chama a função inicialmente
    getCurrentSessionStatus();

    // Configura um intervalo para chamar a função a cada 5 segundos
    const intervalId = setInterval(() => {
      getCurrentSessionStatus();
    }, 2000); 

    // Limpa o intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, []); // O segundo argumento vazio [] garante que isso só seja executado uma vez

  const getCurrentSessionStatus = async () => {
    try {
      // GERAR TOKEN //
      const generateTokenResponse = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/${process.env.NEXT_PUBLIC_API_WPP_SECRET}/generate-token`)
      const { token } = generateTokenResponse.data;

      // INICIAR SESSÃO C/ TOKEN //
      const headersConfig = { headers: { Authorization: `Bearer ${token}` } };

      const statusSessionResponse = await apiWhatsapp.get(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/status-session`, headersConfig)
      const { status } = statusSessionResponse.data;
      console.log(status)

      setStatusSession(status);
      console.log(statusSession)


    } catch (error) {
      console.log(error)
      setStatusSession("Não foi possível obter o status");
    }
  }

  const logoutSession = async () => {
    try {
      const generateTokenResponse = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/${process.env.NEXT_PUBLIC_API_WPP_SECRET}/generate-token`)
      const { token } = generateTokenResponse.data;
      console.log(token)
      const headersConfig = { headers: { Authorization: `Bearer ${token}` } };
      console.log(headersConfig)
      const logoutSession = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/logout-session`, headersConfig)
      console.log(logoutSession)
      setIsLoggedOut(true);
    } catch (error) {
      setIsLoading(false);
    }
  }


  const generateQRCODE = async () => {

    try {
      // GERAR TOKEN //
      const generateTokenResponse = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/${process.env.NEXT_PUBLIC_API_WPP_SECRET}/generate-token`)
      const { token } = generateTokenResponse.data;
      // INICIAR SESSÃO C/ TOKEN //
      const payload = {
        webhook: "http://127.0.0.1:3000/webhook",
        waitQrCode: false
      }
      const headersConfig = { headers: { Authorization: `Bearer ${token}` } };
      const startSessionResponse = await apiWhatsapp.post(`/api/${process.env.NEXT_PUBLIC_API_WPP_SESSION}/start-session`, payload, headersConfig)
      const { qrcode, status } = startSessionResponse.data;
      setqrcodeImg(qrcode);

    } catch (error) {

    }
    // apiWhatsapp.post(``)
    //   .then(response => {
    //     console.log(response.data.token)
    //   }).catch(error => {
    //     console.log(error)
    //   })
  }

  return (
    <>
      <section className="section-header pb-5 pt-3 text-light">
        <div className="container-sm d-flex justify-content-center align-items-center">

          <div className="main-content text-align-center row d-flex justify-content-center align-items-center " >

            <img className="img-hero" style={{ maxWidth: "150px" }} src="/assets/images/hero.svg" />
            <h3 className="display-5 lh-5 font-header"> ROBÔ FATURAS TIM </h3>
            {error
              && <div className="alert alert-warning" role="alert">
                {error}
              </div>}
            {isLoading ? (
              <div>
                <button
                  className="link-light mb-3 text-light btn-success btn btn-lg"
                  type="button"
                  disabled
                >
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Loading...</span>
                </button>
                <button
                  style={{ width: "300px" }}
                  disabled={true}
                  className="link-light mb-3 text-light btn-success btn btn-lg"
                >
                  <i className="far fa-calendar-alt"></i> Aguarde até a
                  conclusão
                </button>
                <a
                  target="blank"
                  href={linkPlanilha}
                  className="link-light text-dark btn-light btn "
                  type="button"
                >
                  {" "}
                  Acompanhar Planilha em Tempo Real{" "}
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
                <p style={{ marginTop: "10px" }}>
                  O processo pode demorar de acordo com a quantidade de
                  registros presentes na planilha atual
                </p>
              </div>
            ) : (
              <>
                <form className="d-flex justify-content-center align-items-center flex-column" onSubmit={(e) => e.preventDefault()}>
                  <label
                    htmlFor="Selecione a planilha"
                    className="form-label"
                  >
                    <h4>
                      <b>Selecione a planilha para iniciar</b>
                    </h4>{" "}
                  </label>
                  <div className="input-group mb-3 input-planilha">
                    <input
                      onChange={onChange}
                      type="file"
                      className="form-control"
                      id="inputGroupFile03"
                      aria-describedby="inputGroupFileAddon03"
                      aria-label="Upload"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />
                    <button
                      onClick={handleUpload}
                      disabled={isLoading || !file}
                      className="link-light text-light btn-success btn "
                      type="button"
                      id="inputGroupFileAddon03"
                    >
                      <b>Iniciar</b>  <i className="fa-solid fa-forward"></i>
                    </button>
                  </div>
                </form>
              </>
            )}

            {!isLoggedOut && (statusSession === "CONNECTED") && <div style={{ maxWidth: "300px", textAlign: "center" }}>
              <h3>Status da sessão</h3>
              <div className="alert alert-info" role="alert"> CONECTADO</div>
              <button onClick={logoutSession} className="btn btn-dark" style={{ maxWidth: "300px" }} >Desconectar <i className="fa-solid fa-right-from-bracket"></i></button>
            </div>}

            {(statusSession !== "CONNECTED") && <div className="d-flex flex-column align-items-center justfy-center" >
              {qrcodeImg && <img style={{ maxWidth: "220px" }} src={qrcodeImg} alt="" />}
              <button
                style={{marginTop: "5px"}}
                onClick={generateQRCODE}
                className="link-light text-dark btn-light btn "
                type="button"
                id="inputGroupFileAddon03"
              >
                Gerar QRCODE <i className="fa-solid fa-qrcode"></i>
              </button>
            </div>}
          </div>
        </div>
      </section>
    </>
  );
}
