document.body.innerHTML = `
<div class="navbar navbar-expand-lg fixed-top navbar-light bg-light">
  <div class="container">
    <a class="navbar-brand" href="https://mfchf.com"><img src="https://mfchf.com/navlogo.png" alt="mfchf" height="30"></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="https://mfchf.com/docs">Docs</a></li>
        <li class="nav-item"><a class="nav-link" href="https://mfchf.com/tests">Testing</a></li>
        <li class="nav-item"><a class="nav-link" href="https://mfchf.com/coverage">Coverage</a></li>
      </ul>
      <form class="d-flex"><a class="btn btn-outline-success my-2 my-sm-0" href="https://github.com/multifactor/mfchf">Get Started</a></form>
    </div>
  </div>
</div>
` + document.body.innerHTML;
