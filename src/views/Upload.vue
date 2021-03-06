<template>
    <v-container fluid fill-height>
      <v-layout  align-center justify-center>
        <v-flex xs6>
          <v-card class="elevation-12">
            <v-card-text>
                <v-form ref="form" v-model="valid">
                  <file-upload v-model="files.primary" message="Select file available for purchase"/>
                  <file-upload v-model="files.preview" message="Select low-res preview file"/>
                  <v-layout  row wrap>
                    <v-flex xs3>
                      <v-text-field
                          @input="onPriceChange()"
                          label="Price in Ether"
                          :rules="priceRules"
                          prepend-icon="euro_symbol"
                          v-model.lazy="price"
                          :suffix="priceSuffix"
                          required>
                      </v-text-field>
                    </v-flex>
                </v-layout>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="submit()" color="info" :disabled="!valid" :loading="isSending">
              Send
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-container v-if="purchaseURL">
            <p>This is the link to your purchase page:</p>
          <v-btn
              router
              :to="purchaseURL"
              flat>
                  {{absolutePurchaseURL}}
          </v-btn>
        </v-container>
        <p :class="{error : formError, msg}">{{msg}}</p>
        </v-flex>
      </v-layout>
    </v-container>

</template>

<script>
import web3 from '@/web3';
import FileUpload from '@/components/FileUpload.vue';
import {
	sendForm,
	addFileToContract,
	getEtherToZarExchangeRate
} from '@/fairPointService';
import { __ } from '@/utils';
import errorMessages from '@/errorMessages';

export default {
	name: 'Upload',
	components: {
		'file-upload': FileUpload
	},
	async created() {
		const exchangeRateResponse = await __(getEtherToZarExchangeRate());
		console.log('exchangeRate', exchangeRateResponse);
		if (exchangeRateResponse.data && exchangeRateResponse.data.data.ZAR) {
			this.exchangeRate = exchangeRateResponse.data.data.ZAR;
			console.log(this.exchangeRate);
		}
	},
	data() {
		return {
			price: 0,
			formError: false,
			valid: false,
			purchaseURL: null,
			absolutePurchaseURL: null,
			msg: '',
			priceSuffix: '',
			isSending: false,
			exchangeRate: undefined,
			ethUnit: 'Ether',
			priceRules: [
				v => !!v || 'Amount is required',
				v => !isNaN(v) || 'Amount must be a number'
				// v => v > 0.01 || 'Amount must be greater than 0'
			],
			files: {
				primary: undefined,
				preview: undefined
			}
		};
	},
	methods: {
		async submit() {
			if (!this.$refs.form.validate()) return;
			this.isSending = true;
			const formResponse = await __(sendForm(this.files));
			if (formResponse.error) {
				this.formError = true;
				this.msg = errorMessages.ERROR_ON_IMAGE_UPLOAD;
				this.isSending = false;
				return;
			}

			const price = web3.utils.toWei(this.price, this.ethUnit);
			const fileID = formResponse.data.data._id;
			const contractResponse = await __(addFileToContract(fileID, price));
			if (contractResponse.error) {
				this.msg = errorMessages.ERROR_ADDING_TO_CONTRACT;
				this.formError = true;
				this.isSending = false;
				return;
			}
			this.isSending = false;
			this.purchaseURL = `/purchase/${fileID}`;
			this.absolutePurchaseURL = `${location.origin}${this.purchaseURL}`;
		},
		onPriceChange() {
			console.log(this.price);
			this.priceSuffix = (this.price * this.exchangeRate).toFixed(2) + ' ZAR';
		}
	}
};
</script>

<style>
.msg {
	padding: 10px;
}
</style>
