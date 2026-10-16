import { here } from "@/app/ui/here";
import { Missing } from "@/app/ui/missing";

const NotFound = async () => <Missing brand={await here()} free={null} />;

export default NotFound;
