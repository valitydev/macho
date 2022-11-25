.SUFFIXES:

NPM = $(shell which npm 2>/dev/null || exit 1)
TSC = ./node_modules/.bin/tsc
PKG = ./node_modules/.bin/pkg

PKG_CACHE_PATH = $(HOME)/.cache/pkg
export PKG_CACHE_PATH

TESTS_ARGS = \
	--external-login '$(TT_LOGIN)' \
	--external-password '$(TT_PASSWORD)' \
	--auth-endpoint $(TT_AUTH_ENDPOINT) \
	--api-endpoint $(TT_API_ENDPOINT) \
	--url-shortener-endpoint $(TT_URLSHORT_ENDPOINT) \
	--test-webhook-receiver-endpoint $(TT_TEST_WEBHOOK_RECEIVER_ENDPOINT) \
	--admin-endpoint $(TT_ADMIN_ENDPOINT) \
	--proxy-endpoint $(TT_PROXY_ENDPOINT)

SWAG_PAYMENTS             = ./schemas/swag-payments/swagger.json
# SWAG_BINBASE              = ./schemas/swag-binbase/swagger.json
SWAG_URL_SHORTENER_V1     = ./schemas/swag-url-shortener/swagger.json
SWAG_WAPI_PAYRES_V0       = ./schemas/swag-wallets/api/payres/swagger.json
SWAG_WAPI_WALLET_V0       = ./schemas/swag-wallets/api/wallet/swagger.json
SWAG_CLAIM_MGMT_V1        = ./schemas/swag-claim-management/swagger.json
SWAG_ANAPI_V2             = ./schemas/swag-anapi-v2/openapi.json

GEN_SWAG_PAYMENTS         = ./api/capi-v2/codegen
# GEN_SWAG_BINBASE          = ./api/binapi/codegen
GEN_SWAG_URL_SHORTENER_V1 = ./api/url-shortener-v1/codegen
GEN_SWAG_WAPI_PAYRES_V0   = ./api/wapi-v0/payres/codegen
GEN_SWAG_WAPI_WALLET_V0   = ./api/wapi-v0/wallet/codegen
GEN_SWAG_CLAIM_MGMT_V1    = ./api/claim-management-v0/codegen
GEN_SWAG_ANAPI_V2         = ./api/anapi-v2/codegen
GEN_SWAG = \
	$(GEN_SWAG_PAYMENTS) \
	$(GEN_SWAG_URL_SHORTENER_V1) \
	$(GEN_SWAG_WAPI_PAYRES_V0) \
	$(GEN_SWAG_WAPI_WALLET_V0) \
	$(GEN_SWAG_CLAIM_MGMT_V1) \
	$(GEN_SWAG_ANAPI_V2)

.PHONY: mocha-tests mocha-tests.tar.gz distclean

# XXX node_modules dir is here to fix import errors in test files
mocha-tests.tar.gz: mocha-tests
	tar zcf mocha-tests.tar.gz -C build . -C .. $^ node_modules

# XXX not installing pkg globally to avoid issues with permissions and bin path
mocha-tests: $(TSC) $(PKG) $(GEN_SWAG)
	$(TSC)
	$(PKG) -t node16-linux-x64 mocha-tests.js -o $@

gen: $(GEN_SWAG)

compile:
	$(TSC)

$(GEN_SWAG_PAYMENTS): $(SWAG_PAYMENTS)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_BINBASE): $(SWAG_BINBASE)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_URL_SHORTENER_V1): $(SWAG_URL_SHORTENER_V1)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_WAPI_PAYRES_V0): $(SWAG_WAPI_PAYRES_V0)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_WAPI_WALLET_V0): $(SWAG_WAPI_WALLET_V0)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_CLAIM_MGMT_V1): $(SWAG_CLAIM_MGMT_V1)
	$(call swagger-codegen,$<,$@)

$(GEN_SWAG_ANAPI_V2): $(SWAG_ANAPI_V2)
	$(call openapi-codegen,$<,$@)

$(TSC):
	$(NPM) i

$(PKG):
	$(NPM) i pkg

distclean:
	rm -rf ./node_modules ./build ./mocha-tests ./api/**/codegen

# tests

.PHONY: gen test test.suite test.transaction

test: test.suite

test.suite: mocha-tests
	./mocha-tests $(TESTS_ARGS)

test.transaction: mocha-tests
	./mocha-tests --tt --timeout $(TT_TIMEOUT) \
		$(TESTS_ARGS) \
		--test-shop-id $(TT_SHOP_ID) --create-test-shop \
		--login-warn $(TT_LOGIN_WARN) \
		--get-my-party-warn $(TT_GET_MY_PARTY_WARN) \
		--create-invoice-warn $(TT_CREATE_INVOICE_WARN) \
		--tokenize-card-warn $(TT_TOKENIZE_CARD_WARN) \
		--create-payment-warn $(TT_CREATE_PAYMENT_WARN) \
		--fulfill-invoice-warn $(TT_FULFILL_INVOICE_WARN)

# swagger-codegen

SWAGGER_CODEGEN = swagger-codegen-cli-2.3.1.jar
SWAGGER_CODEGEN_PREFIX = https://oss.sonatype.org/content/repositories/releases
SWAGGER_CODEGEN_URL := $(SWAGGER_CODEGEN_PREFIX)/io/swagger/swagger-codegen-cli/2.3.1/$(SWAGGER_CODEGEN)

SWAGGER_CODEGEN_V3 = swagger-codegen-cli-3.0.35.jar
SWAGGER_CODEGEN_V3_URL := $(SWAGGER_CODEGEN_PREFIX)/io/swagger/codegen/v3/swagger-codegen-cli/3.0.35/$(SWAGGER_CODEGEN_V3)

define swagger-codegen
	$(MAKE) $(SWAGGER_CODEGEN)
	java -jar $(SWAGGER_CODEGEN) generate -l typescript-fetch -i $(1) -o $(2)
	touch $(2)
endef

define openapi-codegen
	$(MAKE) $(SWAGGER_CODEGEN_V3)
	java -jar $(SWAGGER_CODEGEN_V3) generate -l typescript-fetch -i $(1) -o $(2)
	touch $(2)
endef

$(SWAGGER_CODEGEN):
	wget $(SWAGGER_CODEGEN_URL)

$(SWAGGER_CODEGEN_V3):
	wget $(SWAGGER_CODEGEN_V3_URL)
