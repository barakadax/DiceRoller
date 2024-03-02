import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    main: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: '#6b7b8c',
      alignItems: 'center',
      paddingTop: 35
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      backgroundColor: '#42526e',
      marginTop: 50,
      borderRadius: 5,
      borderColor: '#d9e4e9',
      borderWidth: 1,
      padding: 20,
      gap: 5
    },
    gridItem: {
      width: 80,
      height: 80,
      padding: 20,
      backgroundColor: '#d9e4e9',
      borderColor: '#000',
      borderWidth: 1,
      borderRadius: 5,
      justifyContent: 'center',
    },
    gridItemText: {
      textAlign: 'center',
      color: '#233040',
      fontSize: 30,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#42526e',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      borderWidth: 1,
      textAlign: 'center',
      borderColor: '#d9e4e9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#d9e4e9',
      fontSize: 18,
    },
});