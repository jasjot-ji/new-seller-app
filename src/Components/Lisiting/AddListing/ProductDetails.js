import React, {Component} from 'react';
import {ActivityIndicator, Image, PermissionsAndroid, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import productImage from '../../../Assets/images/product.png';
import AIcon from 'react-native-vector-icons/AntDesign';
import EIcon from 'react-native-vector-icons/Entypo';
import {Picker} from '@react-native-picker/picker';
import {connect} from 'react-redux';
import {baseUrl} from '../../../baseUrl';
let image_options = {
  mediaType: 'photo',
  includeBase64: true,
};

class ProductDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: null,
      showSizeOptions: false,
      selectedVariations: [],
      selectedFullVariations: [],
      variationsData: [],
      product_data: [],
      selectedForm: 0,
      catalog_data: null,
      addImageButtonLoading: false,
      imageLoading: false,
    };
  }
  componentDidMount() {
    console.log(this.props.catalogType);
    if (this.props.catalogType === 'edit-draft') {
      console.log(this.props.selectedCatalog);
      var myHeaders = new Headers();
      myHeaders.append('token', this.props.token);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(`${baseUrl}/prd_lst/fetch_single_catalog/${this.props.selectedCatalog}`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            var myHeaders = new Headers();
            myHeaders.append('token', this.props.token);
            myHeaders.append('Content-Type', 'application/json');

            var raw = JSON.stringify({
              category_4_id: result.product_data[0].category_4_id,
            });

            var requestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: raw,
              redirect: 'follow',
            };

            fetch(`${baseUrl}/prd_lst/fetchProductlistform`, requestOptions)
              .then(response => response.json())
              .then(res => {
                console.log(res);
                if (res.status === 'success') {
                  this.setState({formData: res, catalog_data: result.product_data});
                }
              })
              .catch(error => console.log('error', error));
          }
        })
        .catch(error => console.log('error', error));
    } else {
      var myHeaders = new Headers();
      myHeaders.append('token', this.props.token);
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        category_4_id: this.props.selectedCategory.category_4_id,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(`${baseUrl}/prd_lst/fetchProductlistform`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            this.setState({formData: result});
          }
        })
        .catch(error => console.log('error', error));
    }
  }
  componentDidUpdate() {
    console.log(this.state);
    if (this.state.formData && this.state.product_data.length === 0) {
      if (this.props.catalogType === 'new-catalog') {
        let arr = [];
        console.log(this.props.selectedImages);
        this.props.selectedImages.forEach(img => {
          let prdct_details_fields = [];
          let prdct_size_invt_fields = {};
          let prdct_other_fields = [];
          this.state.formData.productdetailfields.forEach(pd => {
            let field = {
              name: pd.product_details_field.name,
              identifier: pd.product_details_field.identifier,
              value: '',
            };
            prdct_details_fields = [...prdct_details_fields, Object.assign({}, field)];
          });
          this.state.formData.productsizeinvtfields.forEach(pd => {
            prdct_size_invt_fields[pd.identifier] = '';
          });
          this.state.formData.productotherfields.forEach(pd => {
            let field = {
              name: pd.product_other_field.name,
              identifier: pd.product_other_field.identifier,
              value: '',
            };
            prdct_other_fields = [...prdct_other_fields, Object.assign({}, field)];
          });
          let product = {
            category_4_id: this.state.formData.category_data.category_4_id,
            type: 'submit',
            products_data: {
              productdetailfields: [...prdct_details_fields],
              productsizeinvtfields: prdct_size_invt_fields,
              product_variations: [],
              productotherfields: [...prdct_other_fields],
              image_data: {
                front_image_url: img,
                other_images: [],
              },
            },
          };
          arr = [...arr, Object.assign({}, product)];
        });
        this.setState({product_data: arr});
      } else {
        let arr = [];
        this.state.catalog_data.forEach(catalog => {
          let vars = [];
          catalog.product_variants.map(variant => {
            let pv = {
              inventory: `${variant.seller_products_variants[0].inventory}`,
              product_mrp: `${variant.product_mrp}`,
              seller_price: `${variant.seller_products_variants[0].price}`,
              supplier_sku_id: variant.seller_products_variants[0].supplier_sku_id,
              variation_attributes: variant.seller_products_variants[0].variation_attributes_attri,
              variation_name: variant.variation_name,
              variation_name_sku: variant.variation_name_sku,
              variation_value: variant.variation_value,
              variation_value_sku: variant.variation_value_sku,
            };
            vars.push(pv);
          });
          let product = {
            category_4_id: this.state.formData.category_data.category_4_id,
            type: 'submit',
            products_data: {
              productdetailfields: catalog.product_details_attr,
              productsizeinvtfields: {
                comment: catalog.product_description_n,
                supplier_product_id: catalog.product_variants[0].seller_products_variants[0].seller_product.supplier_product_id,
                product_weight_in_gms: `${catalog.product_weight_in_gms}`,
                product_name: catalog.product_name_n,
              },
              product_variations: [...vars],
              productotherfields: catalog.other_details_attri,
              image_data: {
                front_image_url: catalog.products_images[0].url,
                other_images: [],
              },
            },
          };
          arr = [...arr, Object.assign({}, product)];
        });
        this.setState({product_data: arr});
      }
    }
  }
  render() {
    const openGallery = () => {
      launchImageLibrary(image_options, response => {
        if (response.assets) {
          let photo = response.assets[0];
          var myHeaders = new Headers();
          myHeaders.append('token', this.props.token);

          var formdata = new FormData();
          formdata.append('file', {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName,
          });

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow',
          };

          fetch(`${baseUrl}/prd_lst/upload_image_prd_lst`, requestOptions)
            .then(response => response.json())
            .then(result => {
              console.log(result);
              if (result.status === 'success') {
                this.props.alert('Image added !', 'success');
                let pd = [...this.state.product_data];
                let x = [...pd[this.state.selectedForm]?.products_data?.image_data?.other_images];
                x.push(result.url);
                pd[this.state.selectedForm].products_data.image_data.other_images = x;
                this.setState({
                  product_data: pd,
                  addImageButtonLoading: false,
                });
              } else {
                this.setState({addImageButtonLoading: false});
                this.props.alert(result.msg, 'error');
              }
            })
            .catch(error => {
              console.log('error', error);
              this.setState({addImageButtonLoading: false});
            });
        } else {
          this.props.alert('Image not selected !', 'error');
          this.setState({addImageButtonLoading: false});
        }
      });
    };

    const openCamera = () => {
      launchCamera(image_options, response => {
        console.log(response);
        this.setState({photo: response.assets[0]});
      });
    };

    const requestCameraPermission = async type => {
      // console.log(type);
      try {
        this.setState({addImageButtonLoading: true});
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          if (type === 'camera') openCamera();
          else openGallery();
        } else {
          this.setState({addImageButtonLoading: false});
          console.log('Camera permission denied');
        }
      } catch (err) {
        this.setState({addImageButtonLoading: false});
        console.log(err);
      }
    };

    const delImage = img => {
      this.setState({imageLoading: true});
      var myHeaders = new Headers();
      myHeaders.append('token', this.props.token);
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        url: img,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(`${baseUrl}/prd_lst/del_upload_image_prd_lst`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            this.props.alert(result.msg, 'success');
            let x = [];
            let pd = [...this.state.product_data];
            pd[this.state.selectedForm].products_data.image_data.other_images.forEach(photo => {
              if (photo !== img) {
                x.push(photo);
              }
            });
            pd[this.state.selectedForm].products_data.image_data.other_images = x;
            this.setState({product_data: pd});
          } else {
            this.props.alert(result.msg, 'error');
          }
          this.setState({imageLoading: false});
        })
        .catch(error => {
          console.log('error', error);
          this.setState({imageLoading: false});
        });
    };
    

    const reset = () => {
      this.setState({
        showSizeOptions: false,
        selectedVariations: [],
        selectedFullVariations: [],
        variationsData: [],
        selectedForm: 0,
        formData: null,
        product_data: [],
      });
    };
    const discardListing = () => {
      this.props.changeTab('categories');
      reset();
    };

    const saveListing = () => {
      const token = this.props.token;
      let pr = [];
      this.state.product_data.forEach(product => pr.push(Object.assign({}, product.products_data)));
      var raw = JSON.stringify({
        category_4_id: this.state.formData.category_data.category_4_id,
        type: 'draft',
        products_data: pr,
      });

      var requestOptions = {
        method: 'POST',
        headers: {
          token: token,
          'Content-Type': 'application/json',
        },
        body: raw,
        redirect: 'follow',
      };

      fetch(`${baseUrl}/prd_lst/submit_product_lst_form`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            this.props.alert(result.msg, 'success');
            this.props.changeTab('categories');
            reset();
          } else {
            this.props.alert(result.msg, 'error');
          }
        })
        .catch(error => toast.error('error', error));
    };

    const submitListing = () => {
      console.log('here');
      const token = this.props.token;
      let pr = [];
      this.state.product_data.forEach(product => pr.push(Object.assign({}, product.products_data)));
      var raw = JSON.stringify({
        category_4_id: this.state.formData.category_data.category_4_id,
        type: 'submit',
        products_data: pr,
      });

      var requestOptions = {
        method: 'POST',
        headers: {
          token: token,
          'Content-Type': 'application/json',
        },
        body: raw,
        redirect: 'follow',
      };

      fetch(`${baseUrl}/prd_lst/submit_product_lst_form`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            this.props.alert(result.msg, 'success');
            this.props.changeTab('categories');
            reset();
          } else {
            this.props.alert(result.msg, 'error');
          }
        })
        .catch(error => toast.error('error', error));
    };
    return (
      <View>
        <Text style={{fontFamily: 'Roboto-Medium', paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#E6EDFF'}}>Add Product Details</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#697475',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    marginTop: 2,
    fontSize: 14,
  },
  label: {
    fontFamily: 'Roboto-Medium',
    marginLeft: 5,
    fontSize: 14,
    marginBottom: 3,
  },
  inputBox: {
    marginVertical: 5,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#697475',
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 3,
    overflow: 'hidden',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  tablePickerBox: {
    borderWidth: 1,
    borderColor: '#697475',
    backgroundColor: 'white',
    marginTop: 3,
    overflow: 'hidden',
    height: 25,
    display: 'flex',
    justifyContent: 'center',
    fontSize: 14,
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  tableInput: {
    borderWidth: 1,
    borderColor: '#697475',
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 25,
    backgroundColor: 'white',
    marginTop: 2,
    fontSize: 14,
  },
});
const mapStateToProps = state => {
  return {
    token: state.token,
    seller_info: state.seller_info,
  };
};
export default connect(mapStateToProps, null)(ProductDetails);
