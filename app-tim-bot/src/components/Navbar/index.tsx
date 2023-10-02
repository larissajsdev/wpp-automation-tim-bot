import Link from "next/link";
import { useRouter } from "next/router";
export default function Navbar() {

	const router = useRouter();
	return (
		<nav style={{ zIndex: 9 }} className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<a className={`nav-link ${router.pathname == "/" ? "active" : ""}`} aria-current="page" href="/">VAIVENDAS.COM.BR</a>
						</li>
					</ul>
					<Link target="__blank" href={"https://docs.google.com/spreadsheets/d/1xESK6MWJUpvcIAjLwx7qyYANhe14b5-N/edit?usp=sharing&ouid=116760868949508850008&rtpof=true&sd=true"}  className="mx-1 text-light btn-light text-dark btn"><i className="fa-solid fa-download"></i> &ensp;Modelo de Planilha</Link>				</div>
			</div>
		</nav>
	)
}