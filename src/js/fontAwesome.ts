import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleQuestion,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";
import {
  faUpRightFromSquare,
  faSliders,
  fas,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function initIcons(): void {
  library.add(
    faCircleQuestion,
    faUpRightFromSquare,
    faCircleXmark,
    faSliders,
    fas,
  );
  dom.watch();
}
