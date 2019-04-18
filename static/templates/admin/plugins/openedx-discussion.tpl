<form role="form" class="openedx-discussion-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">General</div>
		<div class="col-sm-10 col-xs-12">
			<p class="lead">
				Configure these settings to share session between openEdx and nodebb instance.

				JWT Cookie Name: Name of the encoded jwt cookie that will be sent with requests to nodebb.
				Secret: `key` for "key:value" pair of secret used for jwt encoding and decoding.
				Redirect Login Url: `login-url` for where to direct an user when he tries to login.
				Redirect Registration Url: `registration-url` for where to direct an user when he tries to register.
				Logout Url: `logout-url` is the openedx logout url which will be used to clear session when user logs out from nodebb.
			</p>

			<div class="form-group">
				<label for="jwtCookieNamee">JWT cookie name</label>
				<input type="text" id="jwtCookieName" name="jwtCookieName" title="JWT Cookie Name" class="form-control" placeholder="Token">
			</div>

			<div class="form-group">
				<label for="secret">Secret</label>
				<input type="text" id="secret" name="secret" title="secret" class="secret" placeholder="its a secret">
			</div>

			<div class="form-group">
				<label for="loginURL">Login URL</label>
				<input type="text" id="loginURL" name="loginURL" title="loginURL" class="loginURL" placeholder="https://example.com/login">
			</div>

			<div class="form-group">
				<label for="registrationURL">Registration URL</label>
				<input type="text" id="registrationURL" name="registrationURL" title="registrationURL" class="registrationURL" placeholder="https://example.com/register">
			</div>

			<div class="form-group">
				<label for="logoutURL">Logout redirect URL</label>
				<input type="text" id="logoutURL" name="logoutURL" title="logoutURL" class="logoutURL" placeholder="https://example.com/logout">
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>
