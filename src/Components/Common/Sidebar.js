import React, {Component} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import EIcon from 'react-native-vector-icons/Entypo';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {logoutSeller} from '../../Actions';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Sidebar extends Component {
  componentDidUpdate() {
    if (this.props.token === null && this.props.seller_info === null) {
      this.props.navigation.navigate('Signin');
    }
  }
  render() {
    const logout = async () => {
      this.props.setLogoutSeller();
      this.props.alert('Logout Successfully!', 'success');
    };
    const currentScreen = this.props.navigation.getState()?.routes[this.props.navigation.getState()?.index].name;
    return (
      <View style={styles.sidebar}>
        <View style={{padding: 40, display: 'flex', justifyContent: 'space-between', height: '100%'}}>
          <View>
            <Pressable
              style={styles.nav}
              onPress={() => {
                this.props.closeSideBar();
                this.props.navigation.navigate('Dashboard');
              }}>
              <EIcon name="bar-graph" style={[styles.navText, currentScreen === 'Dashboard' && styles.navTextSelected]} />
              <Text style={[styles.navText, currentScreen === 'Dashboard' && styles.navTextSelected]}>Overview</Text>
            </Pressable>
            <Pressable
              style={styles.nav}
              onPress={() => {
                this.props.closeSideBar();
                this.props.navigation.navigate('Listings');
              }}>
              <EIcon name="shopping-bag" style={[styles.navText, currentScreen === 'Listings' && styles.navTextSelected]} />
              <Text style={[styles.navText, currentScreen === 'Listings' && styles.navTextSelected]}>Product</Text>
            </Pressable>
            <Pressable
              style={styles.nav}
              onPress={() => {
                this.props.closeSideBar();
                this.props.navigation.navigate('Orders');
              }}>
              <EIcon name="shopping-cart" style={[styles.navText, currentScreen === 'Orders' && styles.navTextSelected]} />
              <Text style={[styles.navText, currentScreen === 'Orders' && styles.navTextSelected]}>Orders</Text>
            </Pressable>
            <Pressable
              style={styles.nav}
              onPress={() => {
                this.props.closeSideBar();
                this.props.navigation.navigate('Inventory');
              }}>
              <MIcon name="inventory" style={[styles.navText, currentScreen === 'Inventory' && styles.navTextSelected]} />
              <Text style={[styles.navText, currentScreen === 'Inventory' && styles.navTextSelected]}>Inventory</Text>
            </Pressable>
            <Pressable
              style={styles.nav}
              onPress={() => {
                this.props.closeSideBar();
                this.props.navigation.navigate('Settings');
              }}>
              <MIcon name="settings" style={[styles.navText, currentScreen === 'Settings' && styles.navTextSelected]} />
              <Text style={[styles.navText, currentScreen === 'Settings' && styles.navTextSelected]}>Settings</Text>
            </Pressable>
          </View>
          <Pressable style={styles.nav} onPress={() => logout()}>
            <MIcon name="logout" style={[styles.navText, {color: 'red', fontFamily: 'Roboto-Medium'}]} />
            <Text style={[styles.navText, {color: 'red', fontFamily: 'Roboto-Medium'}]}>Logout</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
});
const mapStateToProps = state => {
  return {
    token: state.token,
    seller_info: state.seller_info,
  };
};
const mapDispatchToProps = dispatch => {
  const setLogoutSeller = () => {
    dispatch(logoutSeller());
  };
  return {
    setLogoutSeller,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
