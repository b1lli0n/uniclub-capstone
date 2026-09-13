import MyProfilePage from '../../pages/home/MyProfilePage'

function MyProfileScreen({ currentUser }) {
  return <MyProfilePage key={currentUser?.id || 'profile'} currentUser={currentUser} />
}

export default MyProfileScreen
